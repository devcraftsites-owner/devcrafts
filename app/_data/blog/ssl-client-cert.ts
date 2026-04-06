import type { BlogArticle } from "./types"

export const article: BlogArticle = {
  slug: "java8-ssl-client-cert-handshake-error",
  title: "Java 8 クライアント証明書で接続できない原因と対処",
  description:
    "Java 8 で SSL クライアント証明書を設定したのに SSLHandshakeException が出る。Apache 用 PEM 形式の証明書を PKCS12 に変換して専用キーストアに配置するまでの記録。",
  publishedAt: "2026-07-01",
  tags: ["SSL", "クライアント証明書", "keytool", "PKCS12", "Java 8", "トラブルシューティング"],
  relatedArticleSlugs: ["aes-encryption", "password-hashing"],
  relatedToolSlugs: ["base64"],

  symptom: `社外システムとの HTTPS 通信で、クライアント証明書を使った相互認証（mutual TLS）が必要になったんですよね。先方から証明書ファイルを受け取って、keytool でキーストアに入れて接続してみたら、いきなり SSLHandshakeException。「証明書が見つからない」的なエラーで、ハンドシェイクの段階でクライアント証明書を提示できていなかった。しかも接続先は自己署名証明書を使っていて、普通の CA チェーン検証とは違う構成だったので、余計に話がややこしくなりました。`,

  environment: "Java 8 / 社外システムとの HTTPS 接続 / 自己署名 SSL 証明書",

  wrongApproach: `最初にやったのは keytool -importcert で証明書ファイルをデフォルトのキーストアにインポートすること。コマンド自体は普通に成功するんですよ。でも接続すると相変わらず SSLHandshakeException。「入れたのになんで？」ってなって、次に -Djavax.net.debug=ssl を付けてデバッグログを出してみたんだけど、これがまた大量に出る。ログを追いかけていくと、ハンドシェイク時にクライアント証明書が送信されていないことが分かった。keytool -list で確認すると、証明書は trustedCertEntry（公開証明書だけのエントリ）として入っていて、秘密鍵を伴う PrivateKeyEntry にはなっていなかった。ここで「あれ、これ秘密鍵が入ってないのでは」と気づきました。`,

  rootCause: `原因は、受け取った証明書ファイルが Apache HTTP Server 向けの PEM 形式（.crt と .key が別ファイル）だったこと。keytool -importcert って公開証明書のインポートにしか対応していなくて、秘密鍵を一緒に取り込めないんですよね。だから「証明書はあるけど秘密鍵がない」状態になって、クライアント認証で証明書を提示できなかった。さらに厄介だったのが、自己署名証明書だったので標準のトラストストア（cacerts）に入れても CA チェーンの検証で弾かれるという二重の問題。エラーメッセージが「証明書が見つからない」としか言ってくれないので、秘密鍵の有無とか形式の問題に気づくまでだいぶ時間がかかりました。`,

  solution: `openssl で PEM 形式の証明書と秘密鍵を PKCS12 形式に変換しました。変換したファイルは標準の cacerts には入れず、専用のキーストアファイルとして別パスに配置。JVM オプションで指定するのではなく、コード内で KeyStore と SSLContext を明示的に組み立てて接続に使うようにしました。自己署名証明書なのでトラストストアも別途用意して登録しています。`,

  solutionCode: `# 1. PEM → PKCS12 変換（証明書 + 秘密鍵を1ファイルにまとめる）
openssl pkcs12 -export \\
  -in client.crt \\
  -inkey client.key \\
  -out client-keystore.p12 \\
  -name client-cert \\
  -password pass:changeit

// 2. Java コード内でキーストアを読み込み、SSLContext を構築
KeyStore keyStore = KeyStore.getInstance("PKCS12");
try (InputStream is = new FileInputStream("/path/to/client-keystore.p12")) {
    keyStore.load(is, "changeit".toCharArray());
}

KeyStore trustStore = KeyStore.getInstance("JKS");
try (InputStream is = new FileInputStream("/path/to/custom-truststore.jks")) {
    trustStore.load(is, "changeit".toCharArray());
}

KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
kmf.init(keyStore, "changeit".toCharArray());

TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
tmf.init(trustStore);

SSLContext sslContext = SSLContext.getInstance("TLS");
sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);

// 3. SSLContext を HttpsURLConnection に適用
HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
conn.setSSLSocketFactory(sslContext.getSocketFactory());`,

  prevention: `クライアント証明書を受け取ったら、まず形式（PEM / PKCS12 / JKS）を確認するのが大事です。keytool -list で PrivateKeyEntry になっているかを必ずチェック。trustedCertEntry しかなければ秘密鍵が入っていません。あと -Djavax.net.debug=ssl,handshake は問題の切り分けに本当に助かるので、SSL 周りで困ったらとりあえず付けてみるのがおすすめです。`,

  searchKeywords: [
    "Java SSL クライアント証明書 エラー",
    "Java SSLHandshakeException クライアント証明書",
    "Java keytool クライアント証明書 秘密鍵",
    "Java PKCS12 変換",
    "Java 自己署名証明書 接続",
    "javax.net.ssl.keyStore 設定",
    "openssl pkcs12 Java",
  ],

  faq: [
    {
      question: "keytool で証明書を入れたのにクライアント証明書が送信されないのはなぜ？",
      answer:
        "keytool -importcert は公開証明書しかインポートできず、秘密鍵が含まれません。PKCS12 形式で秘密鍵ごと入れる必要があります。",
    },
    {
      question: "PEM 形式と PKCS12 形式って何が違うの？",
      answer:
        "PEM は証明書と秘密鍵をテキスト形式で別々のファイルに保存します。PKCS12 は両方をひとつのバイナリファイルにまとめた形式で、Java のキーストアにそのまま読み込めます。",
    },
    {
      question: "SSL デバッグログってどうやって出すの？",
      answer:
        "JVM オプションに -Djavax.net.debug=ssl,handshake を追加するだけです。ハンドシェイクの各ステップが標準出力に出るので、どこで失敗しているか一目で分かります。",
    },
  ],
}
