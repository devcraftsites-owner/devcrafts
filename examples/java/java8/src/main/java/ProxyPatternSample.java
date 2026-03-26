/**
 * DP-12: Proxy パターン
 *
 * オブジェクトへのアクセスを制御する「代理人」を挟むパターンです。
 * 仮想プロキシ（遅延ロード）とアクセス制御プロキシの2種類を示します。
 */
public class ProxyPatternSample {

    // ---- 共通インターフェース ----
    interface ImageLoader {
        /** 画像データを読み込む */
        String load(String path);
        /** 画像を表示する */
        void display();
    }

    // ---- 実際の実装: 重い処理（コンストラクタでロードを行う） ----
    static class RealImageLoader implements ImageLoader {
        private final String path;
        private String imageData;

        public RealImageLoader(String path) {
            this.path = path;
            // コンストラクタで重い処理（ディスクI/Oやネットワーク通信を想定）
            System.out.println("[RealImageLoader] ロード中: " + path);
            this.imageData = "<<" + path + " の画像データ>>";
        }

        @Override
        public String load(String path) {
            return imageData;
        }

        @Override
        public void display() {
            System.out.println("[RealImageLoader] 表示: " + imageData);
        }
    }

    // ---- 仮想プロキシ: 初回 display() まで実オブジェクトの生成を遅らせる ----
    static class LazyImageProxy implements ImageLoader {
        private final String path;
        private RealImageLoader realLoader; // null のまま保持し、必要になるまで生成しない

        public LazyImageProxy(String path) {
            this.path = path;
            // この時点では RealImageLoader を生成しない（遅延ロード）
            System.out.println("[LazyImageProxy] プロキシを作成: " + path);
        }

        @Override
        public String load(String path) {
            // 必要になったとき初めて実オブジェクトを生成する
            if (realLoader == null) {
                realLoader = new RealImageLoader(path);
            }
            return realLoader.load(path);
        }

        @Override
        public void display() {
            // 初回呼び出し時に実オブジェクトを生成する（遅延ロード）
            if (realLoader == null) {
                System.out.println("[LazyImageProxy] 初回: 実オブジェクトを生成します");
                realLoader = new RealImageLoader(path);
            }
            realLoader.display();
        }
    }

    // ---- アクセス制御プロキシ: ロールに基づいてアクセスを制限する ----
    static class AccessControlProxy implements ImageLoader {
        private final ImageLoader delegate; // 委譲先
        private final String userRole;      // ユーザーのロール

        public AccessControlProxy(ImageLoader delegate, String userRole) {
            this.delegate = delegate;
            this.userRole = userRole;
        }

        @Override
        public String load(String path) {
            checkAccess();
            return delegate.load(path);
        }

        @Override
        public void display() {
            checkAccess();
            delegate.display();
        }

        /** アクセス権を確認する。権限がなければ例外をスローする */
        private void checkAccess() {
            if (!"ADMIN".equals(userRole) && !"USER".equals(userRole)) {
                throw new SecurityException(
                        "アクセス拒否: ロール '" + userRole + "' に表示権限がありません");
            }
            System.out.println("[AccessControlProxy] アクセス許可: ロール=" + userRole);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Proxy パターン: 仮想プロキシ（遅延ロード）===");

        // LazyImageProxy を3つ作成しても、この時点では画像データをロードしない
        ImageLoader img1 = new LazyImageProxy("/images/photo1.jpg");
        ImageLoader img2 = new LazyImageProxy("/images/photo2.jpg");
        ImageLoader img3 = new LazyImageProxy("/images/photo3.jpg");
        System.out.println("\n→ この時点ではまだロードされていません");

        System.out.println("\n--- img1 を表示（初回：ここで初めてロードされる）---");
        img1.display();

        System.out.println("\n--- img1 を再表示（2回目：ロード済みなので重い処理は走らない）---");
        img1.display();

        System.out.println("\n=== Proxy パターン: アクセス制御プロキシ ===");

        // USER ロールはアクセス可能
        ImageLoader userProxy = new AccessControlProxy(
                new LazyImageProxy("/images/secret.jpg"), "USER");
        System.out.println("\n--- USER ロールでアクセス ---");
        userProxy.display();

        // GUEST ロールはアクセス不可
        ImageLoader guestProxy = new AccessControlProxy(
                new LazyImageProxy("/images/secret.jpg"), "GUEST");
        System.out.println("\n--- GUEST ロールでアクセス（拒否される）---");
        try {
            guestProxy.display();
        } catch (SecurityException e) {
            System.out.println("例外キャッチ: " + e.getMessage());
        }
    }
}
