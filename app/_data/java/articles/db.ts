import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "jdbc-basics",
  title: "Java JDBC 接続と基本 CRUD 操作の実装方法と注意点",
  categorySlug: "db",
  summary: "DriverManager による接続、Statement での CRUD、try-with-resources による確実なリソース解放を整理する。",
  version: "Java 17",
  tags: ["JDBC", "Connection", "Statement", "CRUD", "try-with-resources"],
  apiNames: ["DriverManager", "Connection", "Statement", "ResultSet", "SQLException"],
  description: "Java 標準 JDBC API で DB 接続から SELECT/INSERT/UPDATE/DELETE の基本操作を実装し、リソース管理の注意点を Java 8/17/21 対応で解説する。",
  lead: "業務システムの多くはデータベースとのやり取りを伴います。Java では JDBC（Java Database Connectivity）が標準 API として用意されており、外部ライブラリを追加しなくても基本的な DB 操作が可能です。フレームワークに任せる場面が増えた今でも、JDBC の基本を押さえておくことはトラブル時の原因調査や、フレームワークが生成する SQL の理解に直結します。DriverManager による接続取得、Statement を使った SELECT・INSERT・UPDATE・DELETE、try-with-resources によるリソースの確実な解放まで整理した。保守案件や社内ツールで「素の JDBC」を触る場面に備え、動作する完結したコードで基本操作を確認できる。",
  useCases: [
    "社内管理ツールから従業員マスタを参照・更新する画面の裏側を JDBC で実装する",
    "バッチ処理で CSV から読み取ったデータを DB テーブルへ INSERT する",
    "障害調査時にフレームワークを経由せず、直接 JDBC でクエリを実行して状態を確認する",
  ],
  cautions: [
    "Statement に直接文字列連結で値を埋め込むと SQL インジェクションの原因になる。ユーザー入力を含む場合は必ず PreparedStatement を使うこと",
    "Connection・Statement・ResultSet は try-with-resources で閉じる。finally で close() を呼ぶ旧式の書き方はリソースリークの温床になりやすい",
    "DriverManager.getConnection の接続文字列はデータベース製品ごとに異なる。H2 のインメモリ DB はテスト用であり、本番では MySQL / PostgreSQL の URL に読み替えること",
    "ResultSet のカラム取得で列名と型を間違えると実行時例外になる。getInt で VARCHAR 列を取ると ClassCastException 相当のエラーになるため、カラム定義と型メソッドの対応に注意する",
    "保守案件で JDBC を直接使っているコードを読むとき、接続のclose漏れがよく見つかる。Connection プールを使っていない古いコードでは特に、finally ブロックの close() が例外で届かないパターンに注意すること。",
  ],
  relatedArticleSlugs: ["exception-chain", "junit5-basics"],
  versionCoverage: {
    java8: "try-with-resources で Connection と Statement を管理する基本形は Java 7 以降同じ。型宣言は明示的に書く必要がある。",
    java17: "var による型推論とテキストブロック（\"\"\"）で SQL を見やすく記述できる。record で行データを型安全に保持する設計が自然に書ける。",
    java21: "sealed interface で検索結果（Found/NotFound/Error）を型安全に表現し、パターンマッチング switch で網羅的に処理できる。",
    java8Code: `// Java 8: 型を明示的に宣言し、文字列連結で SQL を組み立て
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery(
    "SELECT id, name, dept, salary"
    + " FROM employees ORDER BY id");
while (rs.next()) {
    String row = String.format("id=%d name=%s",
        rs.getInt("id"), rs.getString("name"));
    System.out.println(row);
}`,
    java17Code: `// Java 17: var + record + テキストブロックで簡潔に
record Employee(int id, String name, String dept, int salary) {}
var sql = "SELECT id, name, dept, salary FROM employees ORDER BY id";
try (var stmt = conn.createStatement();
     var rs = stmt.executeQuery(sql)) {
    while (rs.next()) {
        var emp = new Employee(
            rs.getInt("id"), rs.getString("name"),
            rs.getString("dept"), rs.getInt("salary"));
    }
}`,
    java21Code: `// Java 21: sealed interface + パターンマッチングで結果を型安全に処理
sealed interface DbResult {
    record Found(List<Employee> rows) implements DbResult {}
    record NotFound() implements DbResult {}
    record Error(String message) implements DbResult {}
}
switch (findByDept(conn, "開発")) {
    case DbResult.Found f -> f.rows().forEach(System.out::println);
    case DbResult.NotFound n -> System.out.println("該当なし");
    case DbResult.Error e -> System.out.println("エラー: " + e.message());
}`,
  },
  libraryComparison: [
    { name: "Pure JDBC（標準 API）", whenToUse: "保守案件や小規模ツール、フレームワーク非依存の処理で使う。", tradeoff: "コード量は多いが依存ゼロで動く。SQL の制御が明示的。" },
    { name: "Spring JdbcTemplate", whenToUse: "Spring Boot プロジェクトで定型的な CRUD を効率化したい場合。", tradeoff: "ボイラープレートが大幅に減るが、Spring への依存が前提になる。" },
    { name: "MyBatis", whenToUse: "SQL を XML やアノテーションで管理し、マッピングを自動化したい場合。", tradeoff: "SQL の可読性は高いが、設定ファイルと学習コストが増える。" },
  ],
  faq: [
    { question: "DriverManager と DataSource はどちらを使うべきですか？", answer: "本番環境では HikariCP などコネクションプール付きの DataSource を使います。DriverManager は接続のたびに TCP ハンドシェイクと DB 認証が発生するため、高頻度アクセスでは性能劣化の原因になります。DriverManager は学習目的や単発ツールのみに留めてください。" },
    { question: "ResultSet のカラムはインデックスと名前のどちらで取得すべきですか？", answer: "可読性と保守性の観点から列名指定（getString(\"name\")）が安全です。列順の変更に影響されません。" },
    { question: "H2 以外の DB で試すにはどうすればよいですか？", answer: "対象 DB の JDBC ドライバを CLASSPATH に追加し、接続文字列・ユーザー・パスワードを変更するだけです。" },
  ],
  codeTitle: "JDBC で従業員テーブルの CRUD を実装する",
  codeSample: `import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class JdbcBasicSample {

    record Employee(int id, String name, String dept, int salary) {}

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
            "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1", "sa", "");
    }

    public static void setup(Connection conn) throws SQLException {
        try (var stmt = conn.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS employees (
                    id     INT PRIMARY KEY,
                    name   VARCHAR(50),
                    dept   VARCHAR(30),
                    salary INT
                )
                """);
            stmt.execute("DELETE FROM employees");
            stmt.execute("INSERT INTO employees VALUES (1, '田中太郎', '営業', 350000)");
            stmt.execute("INSERT INTO employees VALUES (2, '鈴木花子', '開発', 420000)");
            stmt.execute("INSERT INTO employees VALUES (3, '佐藤次郎', '開発', 380000)");
        }
    }

    public static List<Employee> findAll(Connection conn) throws SQLException {
        var results = new ArrayList<Employee>();
        var sql = "SELECT id, name, dept, salary FROM employees ORDER BY id";
        try (var stmt = conn.createStatement();
             var rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                results.add(new Employee(
                    rs.getInt("id"), rs.getString("name"),
                    rs.getString("dept"), rs.getInt("salary")));
            }
        }
        return results;
    }

    public static int updateSalary(Connection conn, int id, int newSalary)
            throws SQLException {
        var sql = "UPDATE employees SET salary = ? WHERE id = ?";
        try (var pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, newSalary);
            pstmt.setInt(2, id);
            return pstmt.executeUpdate();
        }
    }

    public static int delete(Connection conn, int id) throws SQLException {
        var sql = "DELETE FROM employees WHERE id = ?";
        try (var pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            return pstmt.executeUpdate();
        }
    }

    public static void main(String[] args) throws SQLException {
        try (var conn = getConnection()) {
            setup(conn);

            System.out.println("=== 全件取得 ===");
            for (var emp : findAll(conn)) {
                System.out.printf("id=%d name=%s dept=%s salary=%d%n",
                    emp.id(), emp.name(), emp.dept(), emp.salary());
            }

            System.out.println("\\n=== UPDATE ===");
            updateSalary(conn, 1, 370000);
            System.out.println("田中の給与更新完了");

            System.out.println("\\n=== DELETE ===");
            delete(conn, 3);
            System.out.println("削除後: " + findAll(conn).size() + " 件");
        }
    }
}`,
},
{
  slug: "prepared-statements",
  title: "Java PreparedStatement で安全な SQL 実行を実装する",
  categorySlug: "db",
  summary: "パラメータバインド、バッチ処理、SQL インジェクション対策を PreparedStatement で押さえる。",
  version: "Java 17",
  tags: ["PreparedStatement", "SQL インジェクション", "バッチ処理", "パラメータバインド"],
  apiNames: ["PreparedStatement", "Connection.prepareStatement", "PreparedStatement.setInt", "PreparedStatement.setString", "PreparedStatement.addBatch", "PreparedStatement.executeBatch"],
  description: "Java の PreparedStatement によるパラメータバインド・バッチ処理・SQL インジェクション対策を外部ライブラリ不要で Java 8/17/21 対応で解説する。",
  lead: "Statement に文字列連結で値を埋め込む書き方は、SQL インジェクションという深刻なセキュリティリスクを抱えています。PreparedStatement を使えば、SQL とパラメータが分離されるため、悪意ある入力がそのまま SQL として解釈される事態を防げます。セキュリティだけでなく、DB 側で SQL の実行計画をキャッシュできるため、同じ構造のクエリを繰り返す場合にパフォーマンス面でも有利です。この記事では、基本的なパラメータバインドの書き方、複数件を一括処理するバッチ INSERT、そして SQL インジェクションがなぜ危険なのかを具体例で示します。Statement からの移行ポイントも整理するため、既存コードの改善にも役立ちます。",
  useCases: [
    "ユーザーが入力した検索条件で従業員を絞り込む画面を SQL インジェクション対策付きで実装する",
    "CSV ファイルから読み取った数百件のデータを executeBatch でまとめて DB に取り込む",
    "ログイン認証でユーザー名・パスワードを WHERE 条件に使う際に安全なクエリを組み立てる",
  ],
  cautions: [
    "プレースホルダ（?）のインデックスは 1 始まり。0 を指定すると SQLException になるため、setInt(0, ...) は典型的なバグ",
    "IN 句（WHERE id IN (?, ?, ?)）のプレースホルダ数は動的に生成する必要がある。件数に応じて ? を連結するヘルパーを用意するとよい",
    "executeBatch の戻り値は各行の更新件数配列だが、ドライバによっては SUCCESS_NO_INFO（-2）を返す場合がある",
    "PreparedStatement は再利用を前提に設計されている。ループ内で毎回 prepareStatement() を呼ぶのは非効率。ループの外で1回だけ prepare する",
  ],
  relatedArticleSlugs: ["jdbc-basics", "jdbc-transactions", "db-atomic-counter"],
  versionCoverage: {
    java8: "PreparedStatement の API は Java 8 から変わらない。SQL 文字列は + 連結で組み立てる。バッチの戻り値は int[] で受け取る。",
    java17: "テキストブロック（\"\"\"）で複数行の SQL を読みやすく書ける。record でバインド対象のデータを型安全に保持できる。",
    java21: "sealed interface でパラメータ型を列挙し、パターンマッチング switch で型に応じたバインド処理を分岐できる。",
    java8Code: `// Java 8: 型を明示し、文字列連結で SQL を組み立て
String sql = "INSERT INTO users (id, username, email, age)"
    + " VALUES (?, ?, ?, ?)";
PreparedStatement pstmt = conn.prepareStatement(sql);
pstmt.setInt(1, id);
pstmt.setString(2, username);
pstmt.setString(3, email);
pstmt.setInt(4, age);
pstmt.executeUpdate();`,
    java17Code: `// Java 17: テキストブロック + record で簡潔に
record User(int id, String username, String email, int age) {}
var sql = """
    INSERT INTO users (id, username, email, age)
    VALUES (?, ?, ?, ?)
    """;
try (var pstmt = conn.prepareStatement(sql)) {
    pstmt.setInt(1, user.id());
    pstmt.setString(2, user.username());
    pstmt.setString(3, user.email());
    pstmt.setInt(4, user.age());
    pstmt.executeUpdate();
}`,
    java21Code: `// Java 21: sealed interface でパラメータ型を型安全に表現
sealed interface SqlParam {
    record IntParam(int value) implements SqlParam {}
    record StringParam(String value) implements SqlParam {}
    record NullParam(int sqlType) implements SqlParam {}
}

switch (param) {
    case SqlParam.IntParam p    -> pstmt.setInt(idx, p.value());
    case SqlParam.StringParam p -> pstmt.setString(idx, p.value());
    case SqlParam.NullParam p   -> pstmt.setNull(idx, p.sqlType());
}`,
  },
  libraryComparison: [
    { name: "Pure JDBC PreparedStatement", whenToUse: "SQL を直接制御したい場合や、フレームワーク非依存の処理で使う。", tradeoff: "SQL インジェクション対策が標準で組み込まれる。コード量はやや多い。" },
    { name: "Spring NamedParameterJdbcTemplate", whenToUse: "名前付きパラメータ（:name）で SQL の可読性を上げたい場合。", tradeoff: "? の番号管理が不要になるが、Spring 依存が前提。" },
    { name: "jOOQ", whenToUse: "SQL をタイプセーフに組み立て、コンパイル時にエラーを検出したい場合。", tradeoff: "型安全性は高いが、学習コストとライセンスの確認が必要。" },
  ],
  faq: [
    { question: "Statement と PreparedStatement はどう使い分けますか？", answer: "ユーザー入力を含む SQL は必ず PreparedStatement を使います。DDL やリテラルのみの SQL は Statement でも構いません。" },
    { question: "バッチ処理で途中の行がエラーになった場合はどうなりますか？", answer: "ドライバにより挙動が異なります。一般的には BatchUpdateException が発生し、成功した行の情報が配列で取れます。" },
    { question: "PreparedStatement はスレッドセーフですか？", answer: "いいえ。Connection と同様にスレッド間で共有するものではありません。スレッドごとに取得してください。" },
  ],
  codeTitle: "PreparedStatement でパラメータバインドとバッチ処理を実装する",
  codeSample: `import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PreparedStatementSample {

    record User(int id, String username, String email, int age) {}

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
            "jdbc:h2:mem:preptest;DB_CLOSE_DELAY=-1", "sa", "");
    }

    public static void setup(Connection conn) throws SQLException {
        try (var stmt = conn.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id       INT PRIMARY KEY,
                    username VARCHAR(50),
                    email    VARCHAR(100),
                    age      INT
                )
                """);
            stmt.execute("DELETE FROM users");
        }
    }

    public static int insertUser(Connection conn, User user) throws SQLException {
        var sql = """
            INSERT INTO users (id, username, email, age)
            VALUES (?, ?, ?, ?)
            """;
        try (var pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, user.id());
            pstmt.setString(2, user.username());
            pstmt.setString(3, user.email());
            pstmt.setInt(4, user.age());
            return pstmt.executeUpdate();
        }
    }

    public static List<User> findByAge(Connection conn, int minAge)
            throws SQLException {
        var results = new ArrayList<User>();
        var sql = "SELECT id, username, email, age FROM users"
            + " WHERE age >= ? ORDER BY age";
        try (var pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, minAge);
            try (var rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    results.add(new User(
                        rs.getInt("id"), rs.getString("username"),
                        rs.getString("email"), rs.getInt("age")));
                }
            }
        }
        return results;
    }

    public static int[] batchInsert(Connection conn, List<User> users)
            throws SQLException {
        var sql = """
            INSERT INTO users (id, username, email, age)
            VALUES (?, ?, ?, ?)
            """;
        try (var pstmt = conn.prepareStatement(sql)) {
            for (var user : users) {
                pstmt.setInt(1, user.id());
                pstmt.setString(2, user.username());
                pstmt.setString(3, user.email());
                pstmt.setInt(4, user.age());
                pstmt.addBatch();
            }
            return pstmt.executeBatch();
        }
    }

    public static void main(String[] args) throws SQLException {
        try (var conn = getConnection()) {
            setup(conn);

            insertUser(conn, new User(1, "tanaka", "tanaka@example.com", 28));
            insertUser(conn, new User(2, "suzuki", "suzuki@example.com", 35));
            insertUser(conn, new User(3, "sato", "sato@example.com", 22));

            System.out.println("=== age >= 25 ===");
            for (var user : findByAge(conn, 25)) {
                System.out.printf("id=%d username=%s age=%d%n",
                    user.id(), user.username(), user.age());
            }

            var batch = List.of(
                new User(10, "yamada", "yamada@example.com", 30),
                new User(11, "ito", "ito@example.com", 27));
            var counts = batchInsert(conn, batch);
            System.out.println("バッチ件数: " + counts.length);
        }
    }
}`,
},
{
  slug: "jdbc-transactions",
  title: "Java JDBC トランザクション制御と安全なロールバック",
  categorySlug: "db",
  summary: "autoCommit 制御、commit/rollback、残高不足時のロールバックを送金処理で実装する。",
  version: "Java 17",
  tags: ["トランザクション", "JDBC", "commit", "rollback", "autoCommit"],
  apiNames: ["Connection.setAutoCommit", "Connection.commit", "Connection.rollback", "Savepoint", "SQLException"],
  description: "Java JDBC のトランザクション制御を送金処理で実装し、autoCommit・commit・rollback の使い方と注意点を Java 8/17/21 対応で解説する。",
  lead: "業務システムでは「2つ以上のテーブル更新を、すべて成功するかすべて取り消すかのどちらかにしたい」という要件が頻繁に現れます。たとえば送金処理では、送金元の残高を減らす UPDATE と送金先の残高を増やす UPDATE が片方だけ成功してはなりません。JDBC ではデフォルトで autoCommit が ON のため、各 SQL が即座に確定します。トランザクション制御を行うには autoCommit を OFF にしたうえで、全処理が成功したら commit、失敗したら rollback を呼ぶ必要があります。この記事では送金処理を題材に、autoCommit の切り替え、commit と rollback のタイミング、finally での autoCommit 復元、残高不足チェックといった実務で踏む落とし穴を整理します。",
  useCases: [
    "口座間の送金処理で、送金元の減額と送金先の加算を1トランザクションにまとめて整合性を保つ",
    "受注登録で注文ヘッダと明細行を同時に INSERT し、途中失敗時は全行ロールバックする",
    "在庫引当と出荷テーブルへの INSERT を1トランザクションで実行し、在庫不足時に全体を取り消す",
  ],
  cautions: [
    "autoCommit を OFF にしたら、finally ブロックで必ず true に戻すこと。戻し忘れると同じ Connection を再利用した際に意図しないトランザクション状態になる",
    "rollback() 自体が SQLException を投げる可能性がある。catch 内で rollback する場合は、rollback の失敗もハンドリングすること",
    "Connection をコネクションプールから取得する場合、autoCommit の初期値はプールの設定に依存する。明示的に setAutoCommit(false) を呼ぶのが安全",
    "トランザクションは短く保つ。長時間ロックを保持すると他のリクエストがブロックされ、デッドロックの原因にもなる",
    "Savepoint を使うと部分的なロールバックが可能だが、対応していない DB ドライバもある。使用前にドライバの仕様を確認すること",
  ],
  relatedArticleSlugs: ["jdbc-basics", "prepared-statements", "db-atomic-counter"],
  versionCoverage: {
    java8: "Connection の commit/rollback API は Java 8 から変わらない。try-finally で autoCommit の復元を管理する。型宣言は明示的に書く。",
    java17: "var による型推論とテキストブロックで記述が簡潔になる。record でアカウント情報を保持すると可読性が上がる。",
    java21: "sealed interface でトランザクション結果（Committed/RolledBack）を型安全に表現し、例外を戻り値で扱う設計が自然に書ける。",
    java8Code: `// Java 8: 型宣言が明示的、例外で制御フローを表現
Connection conn = getConnection();
conn.setAutoCommit(false);
try {
    Statement stmt = conn.createStatement();
    stmt.executeUpdate("UPDATE accounts SET balance = balance - 30000 WHERE id = 1");
    stmt.executeUpdate("UPDATE accounts SET balance = balance + 30000 WHERE id = 2");
    conn.commit();
} catch (SQLException e) {
    conn.rollback();
    throw e;
} finally {
    conn.setAutoCommit(true);
}`,
    java17Code: `// Java 17: var + record で簡潔に
record Account(int id, String owner, int balance) {}
var conn = getConnection();
conn.setAutoCommit(false);
try (var stmt = conn.createStatement()) {
    stmt.executeUpdate("UPDATE accounts SET balance = balance - 30000 WHERE id = 1");
    stmt.executeUpdate("UPDATE accounts SET balance = balance + 30000 WHERE id = 2");
    conn.commit();
} catch (SQLException e) {
    conn.rollback();
    throw e;
} finally {
    conn.setAutoCommit(true);
}`,
    java21Code: `// Java 21: sealed interface でトランザクション結果を型安全に表現
sealed interface TxResult {
    record Committed(String msg) implements TxResult {}
    record RolledBack(String reason) implements TxResult {}
}
var result = transfer(conn, 1, 2, 30000);
switch (result) {
    case TxResult.Committed c   -> System.out.println("成功: " + c.msg());
    case TxResult.RolledBack rb -> System.out.println("失敗: " + rb.reason());
}`,
  },
  libraryComparison: [
    { name: "Pure JDBC トランザクション", whenToUse: "フレームワークなしで明示的にトランザクション境界を制御したい場合。", tradeoff: "制御が明確だが、commit/rollback/autoCommit 復元の管理コードが必要。" },
    { name: "Spring @Transactional", whenToUse: "Spring Boot でアノテーションベースのトランザクション管理を行う場合。", tradeoff: "宣言的で簡潔だが、プロキシの仕組みを理解していないと意図しない挙動になる。" },
    { name: "JTA（Java Transaction API）", whenToUse: "複数データソースにまたがる分散トランザクションが必要な場合。", tradeoff: "2相コミットに対応するが、構成が重く、導入コストが高い。" },
  ],
  faq: [
    { question: "autoCommit を false にし忘れるとどうなりますか？", answer: "各 SQL が即座に確定するため、途中で失敗しても前の SQL はロールバックできません。トランザクション制御が無効になります。" },
    { question: "コネクションプール使用時も autoCommit の管理は必要ですか？", answer: "はい。プールから取得した Connection の autoCommit 状態はプール設定に依存するため、明示的に設定するのが安全です。" },
    { question: "Savepoint と通常の rollback の違いは何ですか？", answer: "rollback() はトランザクション全体を取り消しますが、rollback(savepoint) は指定地点まで部分的に戻せます。" },
  ],
  codeTitle: "送金処理でトランザクションの commit / rollback を実装する",
  codeSample: `import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class TransactionSample {

    record Account(int id, String owner, int balance) {}

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
            "jdbc:h2:mem:txtest;DB_CLOSE_DELAY=-1", "sa", "");
    }

    public static void setup(Connection conn) throws SQLException {
        try (var stmt = conn.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    id      INT PRIMARY KEY,
                    owner   VARCHAR(50),
                    balance INT
                )
                """);
            stmt.execute("DELETE FROM accounts");
            stmt.execute("INSERT INTO accounts VALUES (1, '田中太郎', 100000)");
            stmt.execute("INSERT INTO accounts VALUES (2, '鈴木花子', 50000)");
        }
    }

    public static void transfer(Connection conn, int fromId, int toId,
            int amount) throws SQLException {
        conn.setAutoCommit(false);
        try {
            var withdraw = "UPDATE accounts SET balance = balance - ? WHERE id = ?";
            try (var pstmt = conn.prepareStatement(withdraw)) {
                pstmt.setInt(1, amount);
                pstmt.setInt(2, fromId);
                if (pstmt.executeUpdate() == 0) {
                    throw new SQLException(
                        "送金元アカウントが見つかりません: id=" + fromId);
                }
            }

            var checkSql = "SELECT balance FROM accounts WHERE id = ?";
            try (var pstmt = conn.prepareStatement(checkSql)) {
                pstmt.setInt(1, fromId);
                try (var rs = pstmt.executeQuery()) {
                    if (rs.next() && rs.getInt("balance") < 0) {
                        throw new SQLException("残高不足: id=" + fromId);
                    }
                }
            }

            var deposit = "UPDATE accounts SET balance = balance + ? WHERE id = ?";
            try (var pstmt = conn.prepareStatement(deposit)) {
                pstmt.setInt(1, amount);
                pstmt.setInt(2, toId);
                if (pstmt.executeUpdate() == 0) {
                    throw new SQLException(
                        "送金先アカウントが見つかりません: id=" + toId);
                }
            }

            conn.commit();
            System.out.println("送金完了: " + amount + " 円");
        } catch (SQLException e) {
            conn.rollback();
            System.out.println("送金失敗（ロールバック）: " + e.getMessage());
            throw e;
        } finally {
            conn.setAutoCommit(true);
        }
    }

    public static List<Account> getBalances(Connection conn)
            throws SQLException {
        var results = new ArrayList<Account>();
        try (var stmt = conn.createStatement();
             var rs = stmt.executeQuery(
                 "SELECT id, owner, balance FROM accounts ORDER BY id")) {
            while (rs.next()) {
                results.add(new Account(
                    rs.getInt("id"), rs.getString("owner"),
                    rs.getInt("balance")));
            }
        }
        return results;
    }

    public static void main(String[] args) throws SQLException {
        try (var conn = getConnection()) {
            setup(conn);

            System.out.println("=== 初期残高 ===");
            getBalances(conn).forEach(a ->
                System.out.printf("  id=%d %s: %,d 円%n",
                    a.id(), a.owner(), a.balance()));

            System.out.println("\\n=== 正常送金（田中 → 鈴木 30,000円）===");
            try {
                transfer(conn, 1, 2, 30000);
            } catch (SQLException e) { /* 処理済み */ }
            getBalances(conn).forEach(a ->
                System.out.printf("  id=%d %s: %,d 円%n",
                    a.id(), a.owner(), a.balance()));

            System.out.println("\\n=== 残高不足（田中 → 鈴木 200,000円）===");
            try {
                transfer(conn, 1, 2, 200000);
            } catch (SQLException e) { /* 処理済み */ }
            System.out.println("ロールバック後の残高:");
            getBalances(conn).forEach(a ->
                System.out.printf("  id=%d %s: %,d 円%n",
                    a.id(), a.owner(), a.balance()));
        }
    }
}`,
},
]
