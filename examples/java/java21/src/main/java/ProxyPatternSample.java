/**
 * DP-12: Proxy パターン（Java 21+）
 *
 * Java 21 では sealed interface + switch パターンマッチングで
 * プロキシの種類を型安全に分類できます。
 *
 * 注意: java.lang.reflect.Proxy を使えば実行時に動的プロキシを生成できます。
 *       AOP（アスペクト指向プログラミング）や DI フレームワーク（Spring など）の
 *       内部実装で広く使われています。
 */
public class ProxyPatternSample {

    // ---- Java 21: sealed interface でプロキシの種類を型安全に表現する ----
    sealed interface ProxyType
            permits ProxyType.Virtual, ProxyType.Protection, ProxyType.Remote {

        /** 仮想プロキシ: 遅延ロード（コストの高いオブジェクト生成を必要になるまで遅らせる） */
        record Virtual(String resourcePath) implements ProxyType {}

        /** 保護プロキシ: アクセス制御（ロールや権限を確認してからアクセスを許可する） */
        record Protection(String userRole, String permission) implements ProxyType {}

        /** リモートプロキシ: ネットワーク越しのオブジェクトをローカルのように扱う */
        record Remote(String endpoint, int timeoutMs) implements ProxyType {}
    }

    // ---- switch パターンマッチングでプロキシの種類を説明する（Java 21+）----
    static String describeProxy(ProxyType type) {
        // record deconstruction でフィールドを直接取り出す（Java 21+）
        return switch (type) {
            case ProxyType.Virtual(var path) ->
                "仮想プロキシ: " + path + " を遅延ロードします";
            case ProxyType.Protection(var role, var perm) ->
                "保護プロキシ: ロール=" + role + " で " + perm + " 権限を確認します";
            case ProxyType.Remote(var endpoint, var timeout) ->
                "リモートプロキシ: " + endpoint + " にタイムアウト " + timeout + "ms で接続します";
        };
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

    // ---- 仮想プロキシ ----
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

    // ---- アクセス制御プロキシ ----
    static class AccessControlProxy implements ImageLoader {
        private final ImageLoader delegate;
        private final String userRole;

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

        private void checkAccess() {
            if (!"ADMIN".equals(userRole) && !"USER".equals(userRole)) {
                throw new SecurityException(
                        "アクセス拒否: ロール '" + userRole + "' に表示権限がありません");
            }
            System.out.println("[AccessControlProxy] アクセス許可: ロール=" + userRole);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Proxy パターン（Java 21）===");

        System.out.println("\n--- sealed interface + switch パターンマッチング ---");

        // record deconstruction で各フィールドを取り出して説明を生成する
        var virtual = new ProxyType.Virtual("/images/large-photo.jpg");
        var protection = new ProxyType.Protection("USER", "READ");
        var remote = new ProxyType.Remote("https://api.example.com/images", 3000);

        System.out.println(describeProxy(virtual));
        System.out.println(describeProxy(protection));
        System.out.println(describeProxy(remote));

        System.out.println("\n--- 仮想プロキシ（遅延ロード）---");
        var img = new LazyImageProxy("/images/photo1.jpg");
        System.out.println("→ まだロードされていません");
        img.display();
        img.display(); // 2回目はロード済み

        System.out.println("\n--- アクセス制御プロキシ ---");
        var userProxy = new AccessControlProxy(new LazyImageProxy("/images/secret.jpg"), "USER");
        userProxy.display();

        var guestProxy = new AccessControlProxy(new LazyImageProxy("/images/secret.jpg"), "GUEST");
        try {
            guestProxy.display();
        } catch (SecurityException e) {
            System.out.println("例外キャッチ: " + e.getMessage());
        }
    }
}
