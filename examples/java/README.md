# java-samples

[java-recipes.pages.dev](https://java-recipes.pages.dev) に掲載しているサンプルコードの JUnit テストを収録しています。

- **サイト**: [java-recipes.pages.dev](https://java-recipes.pages.dev)
- **Next.js プロジェクト**: [GitHub リポジトリ](https://github.com/lylgamin/java-recipes)

## ディレクトリ構成

```
java-samples/
├── pom.xml          ← 親 POM（マルチモジュール）
├── java8/           ← Java 8 対応サンプルのテスト（source/target = 8）
│   └── src/
│       ├── main/java/
│       └── test/java/
├── java17/          ← Java 17 対応サンプルのテスト（source/target = 17）
│   └── src/
│       ├── main/java/
│       └── test/java/
└── java21/          ← Java 21 対応サンプルのテスト（source/target = 21）
    └── src/
        ├── main/java/
        └── test/java/
```

## テストの方針

- **フレームワーク**: JUnit 4
- **観点**: ホワイトボックステスト（コード内部の分岐・ロジックを把握した上でテストケースを設計）
- **境界値**: 最小値・最大値・境界の前後を必ずテストケースに含める
- **コメント**: 各テストメソッドに「何を確認するテストか」を日本語コメントで記載

## コンパイル・テスト実行

> **重要**: Maven は1つの JDK で動作します。Java 17/21 固有の API 互換性を確認するには、
> それぞれの JDK に切り替えて実行する必要があります。必ず3回実行してください。

```bash
JAVA_CANDIDATES=/usr/local/sdkman/candidates/java

# Java 8 でテスト実行
JAVA_HOME=${JAVA_CANDIDATES}/8.0.402-tem mvn test -pl java8 -f pom.xml

# Java 17 でテスト実行
JAVA_HOME=${JAVA_CANDIDATES}/17.0.10-tem mvn test -pl java17 -f pom.xml

# Java 21 でテスト実行
JAVA_HOME=${JAVA_CANDIDATES}/21.0.2-tem mvn test -pl java21 -f pom.xml
```

## サンプル対応表

| ID | サイトページ | テストクラス（予定） |
|:--|:--|:--|
| D-01 | [日付変換](https://java-recipes.pages.dev/dates/d01/) | `dates.D01DateConversionTest` |
| D-02 | [日付フォーマット](https://java-recipes.pages.dev/dates/d02/) | `dates.D02DateFormatTest` |
| D-03 | [消費税計算](https://java-recipes.pages.dev/dates/d03/) | `dates.D03TaxCalcTest` |
| D-04 | [祝日判定](https://java-recipes.pages.dev/dates/d04/) | `dates.D04HolidayTest` |
| D-05 | [営業日計算](https://java-recipes.pages.dev/dates/d05/) | `dates.D05BusinessDayTest` |
| D-06 | [元号変換](https://java-recipes.pages.dev/dates/d06/) | `dates.D06JapaneseEraTest` |
| D-07 | [タイムゾーン処理](https://java-recipes.pages.dev/dates/d07/) | `dates.D07TimeZoneTest` |
| S-01 | [null安全な文字列操作](https://java-recipes.pages.dev/strings/s01/) | `strings.S01NullSafeStringTest` |
| S-02 | [パディング・トリム](https://java-recipes.pages.dev/strings/s02/) | `strings.S02PaddingTest` |
| S-03 | [カンマ区切り・数値フォーマット](https://java-recipes.pages.dev/strings/s03/) | `strings.S03NumberFormatTest` |
| S-04 | [正規表現](https://java-recipes.pages.dev/strings/s04/) | `strings.S04RegexTest` |
| C-01 | [List / Map / Set 基本操作](https://java-recipes.pages.dev/collections/c01/) | `collections.C01CollectionTest` |
| C-02 | [Stream API](https://java-recipes.pages.dev/collections/c02/) | `collections.C02StreamTest` |
| C-03 | [ソート・グルーピング](https://java-recipes.pages.dev/collections/c03/) | `collections.C03SortGroupTest` |
| F-01 | [CSVの読み書き](https://java-recipes.pages.dev/fileio/f01/) | `fileio.F01CsvTest` |
| F-02 | [.propertiesファイル](https://java-recipes.pages.dev/fileio/f02/) | `fileio.F02PropertiesTest` |
| F-03 | [ファイル操作](https://java-recipes.pages.dev/fileio/f03/) | `fileio.F03NioFileTest` |
| N-01 | [HttpClient REST呼び出し](https://java-recipes.pages.dev/network/n01/) | `network.N01HttpClientTest` |
