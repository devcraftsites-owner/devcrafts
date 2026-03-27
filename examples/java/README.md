# Java サンプルコード

[dev-craft.dev](https://dev-craft.dev/java/) に掲載している Java 記事のサンプルコードです。
Java 8 / 17 / 21 の 3 バージョンで同じテーマを実装し、バージョンごとの書き方の違いを確認できます。

すべてのサンプルは **外部ライブラリ不要**（Pure Java 標準 API のみ）で動作します。

- **サイト**: [dev-craft.dev/java/](https://dev-craft.dev/java/)

## ディレクトリ構成

```
examples/java/
├── pom.xml          ← 親 POM（マルチモジュール）
├── java8/           ← Java 8 対応サンプル（source/target = 8）
│   └── src/main/java/   … 113 ファイル
├── java17/          ← Java 17 対応サンプル（source/target = 17）
│   └── src/main/java/   … 113 ファイル
└── java21/          ← Java 21 対応サンプル（source/target = 21）
    └── src/main/java/   … 113 ファイル
```

各バージョンのディレクトリには同じファイル名のサンプルが入っています。
記事ページの「Version Coverage」タブで、バージョン間の記述の違いを比較できます。

## サンプル一覧（カテゴリ別）

### 日付・時刻

BusinessDaySample / DateConversionSample / DateFormatSample / DateParserSample / DateProviderSample / HolidayCalcSample / HolidayCheckSample / JapaneseEraConversionSample / TimeZoneSample

### 文字列・テキスト処理

CsvReadWriteSample / FixedLengthSample / HalfKanaSample / NullSafeStringSample / NumberFormatSample / PaddingTrimSample / RegexSample / ValidationSample

### コレクション・Stream

CollectionBasicSample / SortGroupingSample / StreamApiSample / StreamFunctionSample / FunctionCompositionSample / FunctionInterfaceSample / FunctionalInterfaceSample

### ファイル・I/O

FileIoSample / NioFileSample / JsonSample / XmlSample / YamlSample / PropertiesSample / ZipGzipSample

### ネットワーク・HTTP

HttpClientSample / HttpURLConnectionSample / HttpSocketSample / FtpClientSample / MailSendSample / SmtpSocketSample / TcpSocketSample / UdpSocketSample / MinimalHttpServerSample / PostRequestServerSample / TodoHttpServerSample

### データベース・SQL

JdbcBasicSample / PreparedStatementSample / TransactionSample / DbAtomicCounterSample

### 並行処理・スレッド

ThreadBasicSample / ThreadLocalSample / ExecutorServiceSample / SynchronizedSample / ReentrantLockSample / ConditionLockSample / AtomicCounterSample / VolatileSample / DeadlockSample

### セキュリティ・暗号

AesEncryptionSample / Base64EncodingSample / PasswordHashingSample / DeserializationSecuritySample

### シリアライズ

SerializationBasicSample / ExternalizableSample / TransientSerialVersionSample / RecordSerializeSample / EnumSerializeSample

### enum・record・sealed

EnumBasicSample / EnumAdvancedSample / EnumFinancialSample / EnumSwitchStreamSample / RecordBasicSample / RecordVsClassVsEnumSample / SealedRecordSample

### デザインパターン（GoF）

AbstractFactoryPatternSample / AdapterPatternSample / BridgePatternSample / BuilderPatternSample / ChainOfResponsibilitySample / CommandPatternSample / CompositePatternSample / DecoratorPatternSample / FacadePatternSample / FactoryMethodSample / FlyweightPatternSample / InterpreterPatternSample / IteratorPatternSample / MediatorPatternSample / MementoPatternSample / ObserverPatternSample / PrototypePatternSample / ProxyPatternSample / SingletonPatternSample / StatePatternSample / StrategyPatternSample / TemplateMethodSample / VisitorPatternSample

### 設計原則

SolidPrinciplesSample / InterfaceVsAbstractSample / BusinessRuleValidationSample / CopyPatternSample / CopyPatternSampleAdv / CopyPitfallSample

### JVM・パフォーマンス

GcBasicSample / GcEfficiencySample / JvmOptionsSample / MemoryUsageSample / OutOfMemorySample / PerformanceSample

### その他

CustomAnnotationSample / ExceptionChainSample / ExternalProcessSample / LoggingSample / ReflectionBasicSample / TaxCalculationSample / JUnit5BasicSample

## ビルドと実行

Maven マルチモジュール構成です。バージョンごとに JDK を切り替えて実行してください。

```bash
# Java 17 でテスト実行（推奨）
mvn test -pl java17

# Java 8 でテスト実行
mvn test -pl java8

# Java 21 でテスト実行
mvn test -pl java21

# 全バージョン一括
mvn test
```

## ライセンス

MIT License
