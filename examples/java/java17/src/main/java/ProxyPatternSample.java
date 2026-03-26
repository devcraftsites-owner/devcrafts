/**
 * DP-12: Proxy パターン（Java 17+）
 *
 * Java 17 では var と record を活用して
 * アクセス制御の結果をシンプルに表現できます。
 */
public class ProxyPatternSample {

    // ---- Java 17: record でアクセス制御の結果を表現する ----
    record ProxyResult(boolean proxied, String message) {
        /** アクセス成功の結果を生成する */
        static ProxyResult allowed(String message) {
            return new ProxyResult(true, message);
        }

        /** アクセス拒否の結果を生成する */
        static ProxyResult denied(String reason) {
            return new ProxyResult(false, "アクセス拒否: " + reason);
        }
    }

    // ---- 共通インターフェース ----
    interface ImageLoader {
        String load(String path);
        void display();
    }

    // ---- 実際の実装 ----
    static class RealImageLoader implements ImageLoader {
        private final String path;
        private final String imageData;

        public RealImageLoader(String path) {
            this.path = path;
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

    // ---- 仮想プロキシ: var で型宣言を省略 ----
    static class LazyImageProxy implements ImageLoader {
        private final String path;
        private RealImageLoader realLoader;

        public LazyImageProxy(String path) {
            this.path = path;
            System.out.println("[LazyImageProxy] プロキシを作成: " + path);
        }

        @Override
        public String load(String path) {
            if (realLoader == null) {
                realLoader = new RealImageLoader(path);
            }
            return realLoader.load(path);
        }

        @Override
        public void display() {
            if (realLoader == null) {
                System.out.println("[LazyImageProxy] 初回: 実オブジェクトを生成します");
                realLoader = new RealImageLoader(path);
            }
            realLoader.display();
        }
    }

    // ---- アクセス制御プロキシ: ProxyResult record で結果を返す ----
    static class AccessControlProxy implements ImageLoader {
        private final ImageLoader delegate;
        private final String userRole;

        public AccessControlProxy(ImageLoader delegate, String userRole) {
            this.delegate = delegate;
            this.userRole = userRole;
        }

        @Override
        public String load(String path) {
            var result = checkAccess();
            if (!result.proxied()) {
                throw new SecurityException(result.message());
            }
            return delegate.load(path);
        }

        @Override
        public void display() {
            var result = checkAccess(); // var でローカル変数の型を推論（Java 17+）
            if (!result.proxied()) {
                throw new SecurityException(result.message());
            }
            System.out.println("[AccessControlProxy] アクセス許可: " + result.message());
            delegate.display();
        }

        /** アクセス権を確認して ProxyResult を返す */
        private ProxyResult checkAccess() {
            if ("ADMIN".equals(userRole) || "USER".equals(userRole)) {
                return ProxyResult.allowed("ロール=" + userRole);
            }
            return ProxyResult.denied("ロール '" + userRole + "' に表示権限がありません");
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Proxy パターン（Java 17）===");

        System.out.println("\n--- 仮想プロキシ（遅延ロード）---");
        var img1 = new LazyImageProxy("/images/photo1.jpg");
        System.out.println("→ まだロードされていません");
        img1.display(); // ここで初めてロード
        img1.display(); // 2回目はロード済み

        System.out.println("\n--- アクセス制御プロキシ ---");
        var userProxy = new AccessControlProxy(new LazyImageProxy("/images/secret.jpg"), "USER");
        userProxy.display();

        var guestProxy = new AccessControlProxy(new LazyImageProxy("/images/secret.jpg"), "GUEST");
        try {
            guestProxy.display();
        } catch (SecurityException e) {
            System.out.println("例外キャッチ: " + e.getMessage());
        }

        // ProxyResult record を直接使う例
        var allowed = ProxyResult.allowed("ロール=ADMIN");
        var denied = ProxyResult.denied("権限なし");
        System.out.println("\n--- ProxyResult record の例 ---");
        System.out.println("許可: " + allowed);
        System.out.println("拒否: " + denied);
    }
}
