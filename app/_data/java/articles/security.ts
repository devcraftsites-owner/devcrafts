import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
    slug: "password-hashing",
    title: "Java PBKDF2 パスワードハッシュの安全な実装と検証方法",
    categorySlug: "security",
    summary: "PBKDF2WithHmacSHA256 によるソルト付きハッシュ生成と検証を標準 API で実装する。",
    version: "Java 17",
    tags: ["パスワード", "ハッシュ", "PBKDF2", "ソルト", "セキュリティ"],
    apiNames: ["SecretKeyFactory", "PBEKeySpec", "SecureRandom", "MessageDigest.isEqual"],
    description: "Java 標準 API の PBKDF2WithHmacSHA256 でパスワードハッシュを生成・検証する方法を、タイミング攻撃対策も含めて Java 8/17/21 対応で解説する。",
    lead: "パスワードの保存は、業務システムでもっとも慎重に扱うべき処理の一つです。平文保存はもちろん、MD5 や SHA-256 の単純ハッシュも GPU による総当たり攻撃に対して実質的な防御になりません。OWASP が推奨するのは、ソルト付きのストレッチングハッシュ（PBKDF2・bcrypt・scrypt・Argon2 など）です。Java では PBKDF2WithHmacSHA256 が標準 API だけで使えるため、外部ライブラリなしで安全なパスワードハッシュを実装できます。ソルトの生成、ハッシュの計算、パスワード検証の一連の流れを実装した。タイミング攻撃を防ぐ定数時間比較や、パスワード文字列のメモリクリアといった実務上見落としやすいポイントも整理している。",
    useCases: [
      "社内システムのユーザー登録画面で、入力されたパスワードを PBKDF2 でハッシュ化してデータベースに保存する",
      "ログイン認証時に入力パスワードのハッシュと保存済みハッシュを定数時間比較で照合する",
      "既存システムの MD5 ハッシュを PBKDF2 へ移行するため、初回ログイン時に再ハッシュする仕組みを組み込む",
    ],
    cautions: [
      "MD5 や SHA-256 の単純ハッシュをパスワード保存に使ってはいけない。高速すぎるため、GPU で秒間数十億回の試行が可能になる",
      "ソルトは必ずユーザーごとにランダム生成すること。固定ソルトやソルトなしでは、レインボーテーブル攻撃に対して無防備になる",
      "PBEKeySpec のインスタンスは使用後に clearPassword() を呼んでメモリ上のパスワードをクリアする。GC 任せにすると、ヒープダンプからパスワードが読み取られるリスクがある",
      "パスワードの一致判定には MessageDigest.isEqual() を使う。Arrays.equals() は短絡評価のため、ハッシュの先頭バイトが一致するかどうかで処理時間が変わり、タイミング攻撃の手がかりになる",
      "OWASP 推奨のイテレーション回数（2023年時点で310,000回）はハードウェアの進歩に合わせて見直す必要がある。定数としてコードに埋め込む場合でも、変更しやすい設計にしておくこと",
      "実務で見かける危険な実装として、MD5 ハッシュをそのまま使いつつ「ハッシュ化しているから安全」と思っているケースがある。レガシーコードのパスワード保存方式は必ず確認し、不十分な場合は移行計画を立てること。",
    ],
    relatedArticleSlugs: ["base64-encoding"],
    versionCoverage: {
      java8: "PBKDF2WithHmacSHA256 は Java 8 でも利用可能。var や record が使えないため、ハッシュとソルトは別々の変数で管理する形になる。",
      java17: "var と record を使ってハッシュとソルトを HashResult にまとめられる。コードの見通しが良くなり、返り値の受け渡しが安全になる。",
      java21: "sealed interface で検証結果（Match/Mismatch）を型安全に表現し、switch パターンマッチングで分岐を網羅的に記述できる。",
      java8Code: `// Java 8: ハッシュとソルトを個別に管理
byte[] salt = generateSalt();
byte[] hash = hashPassword(password, salt);
// 検証時も個別に渡す
boolean valid = verifyPassword(
    inputPassword, storedHash, salt);`,
      java17Code: `// Java 17: record でハッシュとソルトをまとめる
record HashResult(byte[] hash, byte[] salt) {}
var result = hashNewPassword(password);
// record から取り出して検証
boolean valid = verify(inputPassword, result);`,
      java21Code: `// Java 21: sealed interface で検証結果を型安全に表現
sealed interface HashVerifyResult {
    record Match(String msg) implements HashVerifyResult {}
    record Mismatch(String msg) implements HashVerifyResult {}
}
switch (verifyWithResult(password, stored)) {
    case Match m    -> handleSuccess(m.msg());
    case Mismatch m -> handleFailure(m.msg());
}`,
    },
    libraryComparison: [
      { name: "標準 API（PBKDF2WithHmacSHA256）", whenToUse: "外部依存なしでパスワードハッシュを実装したいとき。Java 8 以降のどの環境でも動作する。", tradeoff: "bcrypt や Argon2 に比べてメモリハード性がなく、ASIC 攻撃への耐性はやや劣る。ただし適切なイテレーション回数を設定すれば実務上は十分。" },
      { name: "jBCrypt", whenToUse: "bcrypt アルゴリズムを使いたいとき。コスト係数の調整が直感的で、Rails 等の他言語システムとの互換性がある。", tradeoff: "外部依存が増える。Java 標準 API だけで済む要件なら PBKDF2 で十分な場合が多い。" },
      { name: "Argon2-jvm", whenToUse: "メモリハード関数で最高水準のセキュリティが求められるとき。Password Hashing Competition の勝者。", tradeoff: "ネイティブライブラリへの依存があり、環境構築のハードルが上がる。社内システムでは PBKDF2 や bcrypt で十分なケースが大半。" },
    ],
    faq: [
      { question: "PBKDF2 のイテレーション回数はどのくらいに設定すべきですか。", answer: "OWASP は2023年時点で PBKDF2WithHmacSHA256 に対して310,000回を推奨しています。ログイン時の遅延が許容範囲（通常100ms〜500ms）に収まるかを実環境で計測して決めてください。" },
      { question: "ソルトの長さはどのくらい必要ですか。", answer: "16バイト（128ビット）以上が推奨です。NIST SP 800-132 では128ビット以上のランダムソルトを求めています。SecureRandom で生成すれば十分なエントロピーが得られます。" },
      { question: "String ではなく char[] でパスワードを扱う理由は何ですか。", answer: "String は不変でGCまでヒープに残りますが、char[] は使用後に Arrays.fill で上書きできます。ヒープダンプや core dump からパスワードが漏洩するリスクを軽減するためです。" },
    ],
    codeTitle: "PasswordHashingExample.java",
    codeSample: `import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

public class PasswordHashingExample {

    private static final int ITERATIONS = 310_000;
    private static final int KEY_LENGTH = 256;

    record HashResult(byte[] hash, byte[] salt) {}

    /** ソルト生成（16バイト） */
    public static byte[] generateSalt() {
        var salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return salt;
    }

    /** PBKDF2 でハッシュを生成 */
    public static byte[] hashPassword(char[] password, byte[] salt)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        var spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_LENGTH);
        try {
            var factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return factory.generateSecret(spec).getEncoded();
        } finally {
            spec.clearPassword();
        }
    }

    /** ソルト生成 + ハッシュを一括実行 */
    public static HashResult hashNewPassword(char[] password)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        var salt = generateSalt();
        var hash = hashPassword(password, salt);
        return new HashResult(hash, salt);
    }

    /** パスワード検証（定数時間比較） */
    public static boolean verify(char[] password, HashResult stored)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        var inputHash = hashPassword(password, stored.salt());
        return MessageDigest.isEqual(inputHash, stored.hash());
    }

    public static void main(String[] args) throws Exception {
        var password = "MySecureP@ssw0rd".toCharArray();

        // ハッシュ生成
        var result = hashNewPassword(password);
        System.out.println("ソルト: " +
                Base64.getEncoder().encodeToString(result.salt()));
        System.out.println("ハッシュ: " +
                Base64.getEncoder().encodeToString(result.hash()));

        // 検証
        System.out.println("正しい: " + verify(password, result));
        System.out.println("誤り:   " +
                verify("wrong".toCharArray(), result));
    }
}`,
  },
{
    slug: "aes-encryption",
    title: "Java AES-GCM 暗号化と復号の実装方法と IV 管理の注意点",
    categorySlug: "security",
    summary: "AES-256-GCM による暗号化・復号・改ざん検出を Java 標準 API で実装する。",
    version: "Java 17",
    tags: ["AES", "GCM", "暗号化", "復号", "改ざん検出"],
    apiNames: ["Cipher", "KeyGenerator", "SecretKey", "GCMParameterSpec", "SecureRandom"],
    description: "Java 標準 API で AES-256-GCM の暗号化・復号を実装する方法を、IV 管理や改ざん検出も含めて外部ライブラリ不要で Java 8/17/21 対応で解説する。",
    lead: "業務データの暗号化は、個人情報の保護やファイルの秘匿送信など、セキュリティ要件が絡む場面で避けて通れません。Java の javax.crypto パッケージには AES 暗号が標準で組み込まれており、外部ライブラリなしで暗号化と復号が実装できます。この記事では、現在推奨される AES-GCM モード（認証付き暗号）を使った実装を扱います。GCM は暗号化と同時にデータの改ざん検出を行えるため、CBC + HMAC の組み合わせより実装がシンプルになります。IV（初期化ベクトル）の正しい扱い方、鍵の生成方法、暗号文の保存形式、そして改ざんを検出する仕組みまでを一通り整理します。ECB モードを使ってはいけない理由や、IV の再利用がなぜ致命的なのかといった、セキュリティ上の判断材料も補足します。",
    useCases: [
      "データベースに保存する個人情報（メールアドレス・電話番号）をカラムレベルで AES-GCM 暗号化する",
      "外部システムへ送信するファイルを AES-GCM で暗号化し、受信側で復号と改ざんチェックを同時に行う",
      "設定ファイル内のパスワードや API キーを暗号化して保存し、アプリケーション起動時に復号して使用する",
    ],
    cautions: [
      "IV（初期化ベクトル）は暗号化のたびに必ず異なる値を使うこと。同じ鍵で同じ IV を再利用すると、GCM の認証機能が完全に破綻し、平文が推測可能になる",
      "ECB モードは同じ平文ブロックが同じ暗号文になるため、パターンが漏洩する。AES を使うなら GCM か CBC を選ぶこと",
      "暗号文と IV はセットで保存・送信する必要がある。IV を暗号文の先頭に結合する方式が一般的だが、フォーマットをドキュメント化しておかないと復号時に混乱する",
      "SecretKey オブジェクトはシリアライズせず、KeyStore で管理するのが望ましい。コード内にハードコードした鍵は、デコンパイルで簡単に読み取られる",
      "GCM の認証タグ長は128ビットが推奨。短くすると改ざん検出の精度が下がる。NIST SP 800-38D では96ビット以上を求めている",
    ],
    relatedArticleSlugs: ["password-hashing", "base64-encoding"],
    versionCoverage: {
      java8: "AES-GCM は Java 8 でも利用可能。暗号文と IV を byte[] で個別に管理し、結合・分離のロジックを自前で書く必要がある。",
      java17: "record で IV と暗号文をまとめて EncryptedData として扱える。var による型推論でボイラープレートも減り、コードの意図が読みやすくなる。",
      java21: "sealed interface で暗号化・復号の操作を型安全に表現し、switch パターンマッチングで処理を統一的に記述できる。",
      java8Code: `// Java 8: IV と暗号文を byte[] で個別管理
byte[] iv = new byte[12];
new SecureRandom().nextBytes(iv);
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, key,
    new GCMParameterSpec(128, iv));
byte[] cipherText = cipher.doFinal(plainText.getBytes("UTF-8"));
// IV + 暗号文を手動で結合して保存
byte[] result = new byte[iv.length + cipherText.length];
System.arraycopy(iv, 0, result, 0, iv.length);
System.arraycopy(cipherText, 0, result, iv.length, cipherText.length);`,
      java17Code: `// Java 17: record で IV と暗号文をまとめる
record EncryptedData(byte[] iv, byte[] cipherText) {}
var iv = new byte[12];
new SecureRandom().nextBytes(iv);
var cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, key,
    new GCMParameterSpec(128, iv));
var cipherText = cipher.doFinal(plainText.getBytes("UTF-8"));
var encrypted = new EncryptedData(iv, cipherText);`,
      java21Code: `// Java 21: sealed interface で暗号操作を型安全に分岐
sealed interface CipherOp {
    record Encrypt(String plainText) implements CipherOp {}
    record Decrypt(EncryptedData data) implements CipherOp {}
}
String output = switch (op) {
    case CipherOp.Encrypt e -> doEncrypt(e.plainText(), key);
    case CipherOp.Decrypt d -> doDecrypt(d.data(), key);
};`,
    },
    libraryComparison: [
      { name: "標準 API（javax.crypto）", whenToUse: "AES-GCM の暗号化・復号だけで十分な場合。依存ゼロで Java 8 以降のどの環境でも動く。", tradeoff: "高レベルの暗号化ユーティリティは自前で組み立てる必要がある。IV 管理や鍵保管のベストプラクティスを自分で実装することになる。" },
      { name: "Google Tink", whenToUse: "暗号化のベストプラクティスをライブラリに任せたいとき。鍵のローテーションや複数アルゴリズムの切り替えを安全に管理できる。", tradeoff: "Google Cloud との連携が前提の設計になっており、オンプレミス環境では鍵管理の別途検討が必要。" },
      { name: "Bouncy Castle", whenToUse: "標準 API にないアルゴリズム（ChaCha20-Poly1305 等）や、楕円曲線暗号の拡張が必要なとき。", tradeoff: "API が低レベルで学習コストが高い。AES-GCM だけなら標準 API で十分に実装できる。" },
    ],
    faq: [
      { question: "AES-128 と AES-256 のどちらを使うべきですか。", answer: "セキュリティ要件が高い場合は AES-256 を選びます。AES-128 でも現時点では十分な強度がありますが、長期保存データや規制対応では256ビットが求められることがあります。" },
      { question: "GCM モードの IV は何バイトにすべきですか。", answer: "12バイト（96ビット）が NIST 推奨です。12バイト以外も技術的には可能ですが、内部で追加のハッシュ計算が発生しパフォーマンスが落ちるため、12バイト固定が無難です。" },
      { question: "暗号化した鍵をどこに保存すればよいですか。", answer: "Java KeyStore（JKS や PKCS12）に格納するのが標準的です。環境変数やシークレットマネージャー（AWS KMS、HashiCorp Vault 等）と組み合わせる方法もあります。コード内へのハードコードは避けてください。" },
    ],
    codeTitle: "AesGcmEncryptionExample.java",
    codeSample: `import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

public class AesGcmEncryptionExample {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    record EncryptedData(byte[] iv, byte[] cipherText) {}

    /** AES-256 鍵を生成 */
    public static SecretKey generateKey() throws Exception {
        var keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256, new SecureRandom());
        return keyGen.generateKey();
    }

    /** 暗号化 */
    public static EncryptedData encrypt(String plainText, SecretKey key)
            throws Exception {
        var iv = new byte[GCM_IV_LENGTH];
        new SecureRandom().nextBytes(iv);

        var cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key,
                new GCMParameterSpec(GCM_TAG_LENGTH, iv));

        var cipherText = cipher.doFinal(
                plainText.getBytes("UTF-8"));
        return new EncryptedData(iv, cipherText);
    }

    /** 復号 */
    public static String decrypt(EncryptedData data, SecretKey key)
            throws Exception {
        var cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, key,
                new GCMParameterSpec(GCM_TAG_LENGTH, data.iv()));

        return new String(cipher.doFinal(data.cipherText()), "UTF-8");
    }

    /** IV + 暗号文を結合した byte[] に変換 */
    public static byte[] toBytes(EncryptedData data) {
        var result = new byte[data.iv().length + data.cipherText().length];
        System.arraycopy(data.iv(), 0, result, 0, data.iv().length);
        System.arraycopy(data.cipherText(), 0, result,
                data.iv().length, data.cipherText().length);
        return result;
    }

    public static void main(String[] args) throws Exception {
        var key = generateKey();
        var plainText = "機密データ: 顧客ID=12345";

        // 暗号化
        var encrypted = encrypt(plainText, key);
        System.out.println("暗号文: " +
                Base64.getEncoder().encodeToString(toBytes(encrypted)));

        // 復号
        var decrypted = decrypt(encrypted, key);
        System.out.println("復号: " + decrypted);

        // 改ざん検出
        var tampered = toBytes(encrypted);
        tampered[20] ^= 0xFF;
        try {
            var iv = Arrays.copyOfRange(tampered, 0, GCM_IV_LENGTH);
            var ct = Arrays.copyOfRange(tampered, GCM_IV_LENGTH,
                    tampered.length);
            decrypt(new EncryptedData(iv, ct), key);
        } catch (Exception e) {
            System.out.println("改ざん検出: " + e.getClass().getSimpleName());
        }
    }
}`,
  },
]
