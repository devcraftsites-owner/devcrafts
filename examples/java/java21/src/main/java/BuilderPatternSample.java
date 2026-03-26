public class BuilderPatternSample {

    // ❌ アンチパターン: 引数が多いコンストラクタ（テレスコーピングコンストラクタ）
    static class BadHttpRequest {
        public BadHttpRequest(String url, String method, String body,
                              int timeout, boolean followRedirect, String userAgent) {
            // 何番目の引数が何かわかりにくい
        }
    }

    // ✅ Builder パターン: 名前付き・段階的に構築
    static class HttpRequest {
        private final String url;
        private final String method;
        private final String body;
        private final int timeoutMs;
        private final boolean followRedirect;
        private final String userAgent;

        private HttpRequest(Builder builder) {
            this.url = builder.url;
            this.method = builder.method;
            this.body = builder.body;
            this.timeoutMs = builder.timeoutMs;
            this.followRedirect = builder.followRedirect;
            this.userAgent = builder.userAgent;
        }

        @Override
        public String toString() {
            return "HttpRequest{url=" + url + ", method=" + method
                + ", timeout=" + timeoutMs + "ms, followRedirect=" + followRedirect + "}";
        }

        static class Builder {
            private final String url;
            private String method = "GET";
            private String body = "";
            private int timeoutMs = 30000;
            private boolean followRedirect = true;
            private String userAgent = "java-recipes/1.0";

            public Builder(String url) {
                if (url == null || url.isEmpty()) {
                    throw new IllegalArgumentException("URL は必須です");
                }
                this.url = url;
            }

            public Builder method(String method) { this.method = method; return this; }
            public Builder body(String body) { this.body = body; return this; }
            public Builder timeout(int ms) {
                if (ms <= 0) throw new IllegalArgumentException("タイムアウトは正の値を指定してください");
                this.timeoutMs = ms;
                return this;
            }
            public Builder followRedirect(boolean follow) { this.followRedirect = follow; return this; }
            public Builder userAgent(String ua) { this.userAgent = ua; return this; }
            public HttpRequest build() { return new HttpRequest(this); }
        }
    }

    // Java 21: sealed interface でビルドの各ステップを型安全に表現
    sealed interface BuildStep
            permits BuildStep.Required, BuildStep.Optional, BuildStep.Complete {
        record Required(String url) implements BuildStep {}
        record Optional(String fieldName, Object value) implements BuildStep {}
        record Complete(HttpRequest request) implements BuildStep {}
    }

    // switch パターンマッチングで各ステップを処理（Java 21+）
    static void describeStep(BuildStep step) {
        switch (step) {
            case BuildStep.Required(var url) ->
                System.out.println("必須ステップ: URL=" + url);
            case BuildStep.Optional(var name, var value) ->
                System.out.println("オプションステップ: " + name + "=" + value);
            case BuildStep.Complete(var request) ->
                System.out.println("完了: " + request);
        }
    }

    // メールメッセージの Builder 例
    static class EmailMessage {
        private final String to;
        private final String subject;
        private final String body;
        private final String cc;
        private final boolean htmlEnabled;

        private EmailMessage(Builder b) {
            this.to = b.to;
            this.subject = b.subject;
            this.body = b.body;
            this.cc = b.cc;
            this.htmlEnabled = b.htmlEnabled;
        }

        @Override
        public String toString() {
            return "Email{to=" + to + ", subject=" + subject + ", cc=" + cc + "}";
        }

        static class Builder {
            private final String to;
            private final String subject;
            private String body = "";
            private String cc = "";
            private boolean htmlEnabled = false;

            public Builder(String to, String subject) {
                this.to = to;
                this.subject = subject;
            }

            public Builder body(String body) { this.body = body; return this; }
            public Builder cc(String cc) { this.cc = cc; return this; }
            public Builder html(boolean enabled) { this.htmlEnabled = enabled; return this; }
            public EmailMessage build() { return new EmailMessage(this); }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Builder パターン: HttpRequest（Java 21）===");

        var req1 = new HttpRequest.Builder("https://api.example.com/users")
            .method("POST")
            .body("{\"name\":\"田中\"}")
            .timeout(5000)
            .followRedirect(false)
            .build();
        System.out.println(req1);

        var req2 = new HttpRequest.Builder("https://api.example.com/users")
            .build();
        System.out.println(req2);

        System.out.println("\n=== sealed interface + switch パターンマッチング（Java 21+）===");
        // ビルドの各ステップを型安全に記録・処理
        describeStep(new BuildStep.Required("https://api.example.com/users"));
        describeStep(new BuildStep.Optional("timeout", 5000));
        describeStep(new BuildStep.Optional("method", "POST"));
        describeStep(new BuildStep.Complete(req1));

        System.out.println("\n=== Builder パターン: EmailMessage ===");
        var email = new EmailMessage.Builder("taro@example.com", "ご連絡")
            .body("本文です")
            .cc("hanako@example.com")
            .html(true)
            .build();
        System.out.println(email);

        System.out.println("\n=== 標準ライブラリの Builder 例 ===");
        var sb = new StringBuilder()
            .append("Hello, ")
            .append("World")
            .append("!");
        System.out.println(sb.toString());
    }
}
