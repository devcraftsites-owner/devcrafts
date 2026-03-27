export type ToolPriority = "priority" | "supporting" | "conditional" | "deferred"
export type ToolStatus = "ready" | "planned"

export type ToolFaqItem = {
  question: string
  answer: string
}

export type ToolInputField = {
  label: string
  type: "date" | "text"
  value: string
  helpText?: string
}

export type ToolDefinition = {
  slug: string
  name: string
  priority: ToolPriority
  summary: string
  category: string
  status: ToolStatus
  description?: string
  keywords?: string[]
  features?: string[]
  cautions?: string[]
  faq?: ToolFaqItem[]
  inputFields?: ToolInputField[]
  resultPreview?: string
  relatedArticleSlugs?: string[]
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: "business-days",
    name: "営業日計算",
    priority: "priority",
    category: "calc",
    status: "ready",
    summary: "開始日、終了日、土曜除外、祝日リストから営業日数を計算する。",
    description:
      "指定期間の営業日数を土日・祝日を除外してブラウザ内だけで計算する。土曜出勤の有無や独自の休業日にも対応。",
    keywords: ["営業日", "稼働日", "土日祝", "祝日", "カレンダー", "日数計算", "business days", "workdays"],
    features: [
      "開始日〜終了日の営業日数を即座に計算",
      "土曜日の除外・含有を切り替え可能",
      "祝日リストをテキスト入力で自由に指定",
      "除外内訳（土日数・祝日数）を表示",
    ],
    cautions: [
      "祝日は自動取得ではなく手入力で指定する。日本の祝日計算ツールと併用すると便利。",
      "週末に重なる祝日は土日として数え、祝日として二重カウントしない。",
      "開始日・終了日の両端を含んだ日数で計算する。",
    ],
    faq: [
      {
        question: "土曜出勤がある場合はどうすればよいですか。",
        answer: "「土曜日を休日として扱う」のチェックを外すと、日曜のみが休日になります。",
      },
      {
        question: "祝日リストはどこで取得できますか。",
        answer: "このサイトの「日本の祝日計算」ツールで年ごとの祝日一覧を生成し、そのまま貼り付けて使えます。",
      },
      {
        question: "開始日と終了日が同じ場合はどうなりますか。",
        answer: "その日が営業日なら 1 日、休日なら 0 日と表示します。両端含みで計算するため、開始日と終了日が同じ場合はその1日だけを判定します。",
      },
    ],
    inputFields: [
      { label: "開始日", type: "date", value: "2026-03-01", helpText: "YYYY-MM-DD 形式" },
      { label: "終了日", type: "date", value: "2026-03-31", helpText: "YYYY-MM-DD 形式" },
      { label: "祝日リスト", type: "text", value: "2026-03-20", helpText: "改行・カンマ・セミコロン区切り" },
    ],
    resultPreview: "営業日数: 22 日 / 全日数: 31 日 / 土日除外: 8 日 / 祝日除外: 1 日",
    relatedArticleSlugs: ["localdate-business-days", "japan-holiday-list"],
  },
  {
    slug: "japan-holidays",
    name: "日本の祝日計算",
    priority: "priority",
    category: "calc",
    status: "ready",
    summary: "指定年の祝日一覧を計算し、営業日計算へ流用しやすい日付リストを出力する。",
    description:
      "1948〜2100年の日本の祝日を振替休日込みで計算し、yyyy-mm-dd 形式の日付リストとしてコピーできるようにする。営業日計算や勤怠システムの祝日マスタ確認に使える。",
    keywords: ["祝日", "日本", "振替休日", "国民の祝日", "営業日", "カレンダー", "祝日一覧", "holiday"],
    features: [
      "1948〜2100年の祝日を主要な法律改正に沿って計算（臨時の祝日移動を除く）",
      "春分の日・秋分の日を天文計算式で算出",
      "振替休日（日曜と重なった場合の翌平日）を自動付与",
      "yyyy-mm-dd 形式の日付リストをワンクリックでコピー",
    ],
    cautions: [
      "春分の日・秋分の日は近似式による計算値であり、国立天文台の官報公示とは異なる場合がある。",
      "オリンピック等による臨時の祝日移動には対応していない。",
      "1948年以前の祝祭日は対象外。",
    ],
    faq: [
      {
        question: "春分の日と秋分の日はどのように算出していますか。",
        answer: "天文学的な近似式を使って計算しています。官報で公示される日付と1日ずれる可能性があります。",
      },
      {
        question: "振替休日はどのルールで計算されますか。",
        answer: "祝日が日曜日と重なった場合、その後の最も近い平日（祝日でない日）を振替休日とします。",
      },
      {
        question: "2020年や2021年のオリンピック特例には対応していますか。",
        answer: "対応していません。海の日・スポーツの日・山の日の臨時移動は反映されていないため、該当年は注意が必要です。",
      },
    ],
    inputFields: [
      { label: "対象年", type: "text", value: "2025", helpText: "1948〜2100 の整数" },
    ],
    resultPreview: "2025-01-01 元日 / 2025-01-13 成人の日 / ... 全16件以上",
    relatedArticleSlugs: ["japan-holiday-list"],
  },
  {
    slug: "wareki",
    name: "西暦・和暦変換",
    priority: "priority",
    category: "convert",
    status: "ready",
    summary: "西暦と和暦を相互変換し、元号境界と英字略号を扱う。",
    description:
      "帳票や申請データで壊れやすい和暦入力を、元号境界と元年表記まで含めてブラウザ内だけで検算できるようにする。",
    keywords: ["和暦", "元号", "西暦", "令和", "平成", "昭和", "大正", "R", "H", "S", "T", "元年"],
    features: [
      "YYYY-MM-DD を和暦漢字表記と略号表記へ変換",
      "令和 / 平成 / 昭和 / 大正 と R / H / S / T を逆変換",
      "元年表記と元号境界日の妥当性を同時に確認",
    ],
    cautions: [
      "対象元号は令和・平成・昭和・大正の4つ。明治以前は扱いません。",
      "内部では西暦日付で比較し、表示時にだけ元年表記へ変換します。",
      "受理できる入力形式は限定しています。ヘルプテキストで確認してください。",
    ],
    faq: [
      {
        question: "令和元年と令和1年は同じものとして扱えますか。",
        answer: "扱えます。内部では 1 年に正規化し、表示時にだけ元年へ戻します。",
      },
      {
        question: "平成31年5月1日は受け付けますか。",
        answer: "受け付けません。2019年5月1日以降は令和なので、元号境界をまたぐ入力はエラーにします。",
      },
      {
        question: "大正の開始日はいつですか。",
        answer: "1912年7月30日です。明治45年7月30日と大正元年7月30日は同じ日にあたります。",
      },
    ],
    inputFields: [
      { label: "西暦日付", type: "date", value: "2019-05-01", helpText: "YYYY-MM-DD 形式" },
      { label: "和暦テキスト", type: "text", value: "令和元年5月1日", helpText: "令和元年5月1日 / R1-05-01 など" },
    ],
    resultPreview: "令和元年5月1日 / R1-05-01 / 2019-05-01",
    relatedArticleSlugs: ["wareki-conversion", "japan-holiday-list"],
  },
  {
    slug: "timezone",
    name: "タイムゾーン変換",
    priority: "priority",
    category: "convert",
    status: "ready",
    summary: "入力日時を複数タイムゾーンへ一括変換する。",
    description:
      "指定した日時を UTC・JST・CST・IST・CET・EST・PST・AEST の8タイムゾーンへブラウザ内だけで一括変換する。海外拠点との会議調整やログ解析に使える。",
    keywords: ["タイムゾーン", "時差", "UTC", "JST", "EST", "PST", "CET", "IST", "AEST", "timezone", "時刻変換", "世界時計"],
    features: [
      "8つの主要タイムゾーンへ一括変換",
      "日時入力とタイムゾーン選択だけのシンプル操作",
      "日付変更線をまたぐ変換も正しく処理",
      "日付のみ入力時は 00:00 として扱う",
    ],
    cautions: [
      "夏時間（DST）には対応していません。EST/PST 等は標準時の固定オフセットで計算します。",
      "対応タイムゾーンは UTC・JST・CST・IST・CET・EST・PST・AEST の8つに限定しています。",
      "入力形式は YYYY-MM-DD HH:mm または YYYY-MM-DD のみ受け付けます。",
    ],
    faq: [
      {
        question: "夏時間（サマータイム）には対応していますか。",
        answer: "対応していません。EST は常に UTC-5、CET は常に UTC+1 として計算します。夏時間適用期間中は手動で1時間を加算してください。",
      },
      {
        question: "日付だけ入力した場合はどうなりますか。",
        answer: "00:00（深夜0時）として扱います。時刻が必要な場合は HH:mm を付けて入力してください。",
      },
      {
        question: "CST は米国中部標準時ですか、中国標準時ですか。",
        answer: "このツールでは中国標準時（UTC+8）として扱っています。米国中部標準時（UTC-6）が必要な場合は EST に1時間加算してください。",
      },
    ],
    inputFields: [
      { label: "日時", type: "text", value: "2026-03-26 12:00", helpText: "YYYY-MM-DD HH:mm 形式" },
    ],
    resultPreview: "UTC 03:00 / JST 12:00 / EST 22:00(前日) / PST 19:00(前日) など8ゾーン一括表示",
    relatedArticleSlugs: [],
  },
  {
    slug: "tax-calculator",
    name: "消費税計算",
    priority: "priority",
    category: "calc",
    status: "ready",
    summary: "税抜・税込の相互計算、10% / 8% 税率、端数処理を扱う。",
    description:
      "税抜金額と税込金額を相互変換し、標準税率10%と軽減税率8%、切り捨て・切り上げ・四捨五入の端数処理をブラウザ内だけで計算する。",
    keywords: ["消費税", "税込", "税抜", "税率", "10%", "8%", "軽減税率", "端数処理", "切り捨て", "四捨五入", "tax calculator"],
    features: [
      "税抜 → 税込、税込 → 税抜の双方向計算",
      "標準税率10%と軽減税率8%を切り替え可能",
      "切り捨て・切り上げ・四捨五入の3種類の端数処理に対応",
      "消費税額・税抜金額・税込金額を同時に表示",
    ],
    cautions: [
      "端数処理の方式は取引先や社内ルールによって異なるため、実務で使う際は自社の経理ルールを確認してください。",
      "インボイス制度では原則として切り捨てが採用されていますが、契約により異なる場合があります。",
      "計算結果は参考値であり、正式な税務処理には税理士や経理部門の確認を推奨します。",
    ],
    faq: [
      {
        question: "軽減税率8%が適用されるのはどのような商品ですか。",
        answer: "飲食料品（酒類を除く）と週2回以上発行される定期購読の新聞が対象です。外食やケータリングは標準税率10%になります。",
      },
      {
        question: "端数処理はどの方式を使えばよいですか。",
        answer: "インボイス制度では切り捨てが一般的ですが、契約や社内規定で異なる場合があります。取引先の請求書と照合して確認してください。",
      },
      {
        question: "税込1,099円の税抜金額が計算方法によって変わるのはなぜですか。",
        answer: "端数処理の方式（切り捨て・切り上げ・四捨五入）によって1円単位の差が生じるためです。同じ端数処理を一貫して使うことが重要です。",
      },
    ],
    inputFields: [
      { label: "金額", type: "text", value: "1000", helpText: "整数または小数で入力" },
    ],
    resultPreview: "税込金額: 1,100 円 / 消費税額: 100 円 / 税率: 10% / 端数処理: 切り捨て",
  },
  {
    slug: "percentage-calculator",
    name: "割合・パーセント計算",
    priority: "priority",
    category: "calc",
    status: "ready",
    summary: "割合、増減率、逆算など 4 パターンの計算を扱う。",
    description:
      "「何%か」「n%はいくつか」「増減率」「全体の逆算」の4パターンをブラウザ内だけで計算する。見積もりや報告書の検算に使える。",
    keywords: ["パーセント", "割合", "増減率", "百分率", "percent", "percentage", "計算", "逆算"],
    features: [
      "A は B の何%かを即座に計算",
      "A の n% がいくつかを計算",
      "A から B への増減率を計算",
      "部分の値と割合から全体を逆算",
    ],
    cautions: [
      "小数点以下6桁で丸めて表示します。それ以上の精度が必要な場合は専用の計算ソフトをご利用ください。",
      "入力は半角数値のみ対応しています。カンマ区切りや全角数字は受け付けません。",
      "ゼロで割る計算（例: B に 0 を指定した割合計算）はエラーになります。",
    ],
    faq: [
      {
        question: "小数を含む数値も計算できますか。",
        answer: "計算できます。入力欄に小数点付きの値（例: 7.5）を入力してください。",
      },
      {
        question: "負の数を入力するとどうなりますか。",
        answer: "負の数もそのまま計算します。増減率では負の値が減少を意味します。",
      },
      {
        question: "増減率で変更前が0の場合はどうなりますか。",
        answer: "変更前が 0 のとき増減率は数学的に定義できないため、「変更前の値が 0 のため計算できません」というエラーメッセージを表示します。",
      },
    ],
    inputFields: [
      { label: "値A", type: "text", value: "25", helpText: "半角数値" },
      { label: "値B", type: "text", value: "200", helpText: "半角数値" },
    ],
    resultPreview: "25 は 200 の 12.5%",
    relatedArticleSlugs: [],
  },
  {
    slug: "unit-converter",
    name: "単位変換",
    priority: "priority",
    category: "calc",
    status: "ready",
    summary: "長さ、重量、温度、速度、面積を基準単位経由で変換する。",
    description:
      "長さ・重量・温度・速度・面積の5カテゴリをブラウザ内だけで一括変換する。メートル法・ヤードポンド法・日本の伝統単位に対応。",
    keywords: ["単位変換", "長さ", "重量", "温度", "速度", "面積", "メートル", "ポンド", "坪", "unit converter"],
    features: [
      "長さ・重量・温度・速度・面積の5カテゴリに対応",
      "基準単位を介して全単位へ一括変換",
      "尺・寸・貫・匁・坪・畳など日本の伝統単位にも対応",
      "入力と同時にリアルタイムで変換結果を表示",
    ],
    cautions: [
      "温度変換は非線形のため、差分の変換には使えません（例: 10°C の差は 10K の差ですが 18°F の差）。",
      "浮動小数点演算のため、極端に大きい値や小さい値では丸め誤差が生じる場合があります。",
      "日本の伝統単位（尺、寸、坪など）は一般的に使われる換算値を採用しています。",
    ],
    faq: [
      {
        question: "坪と畳はどのような換算値を使っていますか。",
        answer: "1坪 = 400/121 m²（約3.306 m²）、1畳 = 200/121 m²（約1.653 m²）で計算しています。",
      },
      {
        question: "華氏から摂氏への変換式は何ですか。",
        answer: "°C = (°F - 32) × 5/9 で計算しています。-40°C と -40°F が一致する点で検算できます。",
      },
      {
        question: "ノットはどのように換算していますか。",
        answer: "1ノット = 1852/3600 m/s（1海里毎時）で計算しています。",
      },
    ],
    inputFields: [
      { label: "数値", type: "text", value: "1", helpText: "変換する数値" },
    ],
    resultPreview: "1 m = 100 cm = 0.001 km = 3.281 ft = 1.094 yd",
    relatedArticleSlugs: [],
  },
  {
    slug: "json-formatter",
    name: "JSONフォーマッター",
    priority: "supporting",
    category: "format",
    status: "ready",
    summary: "JSON の整形・圧縮・構文チェックをブラウザ内で行う。",
    description:
      "貼り付けた JSON を整形（Pretty Print）または1行に圧縮し、構文エラーの位置も報告する。API レスポンスの確認やログ解析に使える。",
    keywords: ["JSON", "フォーマッター", "整形", "圧縮", "構文チェック", "Pretty Print", "minify", "formatter"],
    features: [
      "JSON をインデント付きで見やすく整形（2/4/8 スペース）",
      "1行に圧縮してサイズを削減",
      "構文エラー時にエラー位置を報告",
      "行数とバイトサイズを表示",
    ],
    cautions: [
      "JavaScript の JSON.parse に準拠するため、末尾カンマやコメントは受け付けません。",
      "数値の精度は JavaScript の Number 型（IEEE 754 倍精度）に依存します。",
      "巨大な JSON（数 MB 以上）ではブラウザの処理に時間がかかる場合があります。",
    ],
    faq: [
      {
        question: "コメント付きの JSON（JSONC）は使えますか。",
        answer: "使えません。標準の JSON 仕様に準拠しているため、コメントは構文エラーになります。",
      },
      {
        question: "整形後のデータは元の JSON と同じですか。",
        answer: "同じです。空白とインデントのみが変わり、データの値や順序は変更されません。",
      },
      {
        question: "日本語を含む JSON も処理できますか。",
        answer: "処理できます。UTF-8 のマルチバイト文字はそのまま保持されます。",
      },
    ],
    inputFields: [
      { label: "JSON", type: "text", value: '{"name":"太郎","age":30}', helpText: "整形または圧縮したい JSON を入力" },
    ],
    resultPreview: '{\n  "name": "太郎",\n  "age": 30\n}',
    relatedArticleSlugs: [],
  },
  {
    slug: "base64",
    name: "Base64変換",
    priority: "supporting",
    category: "encode",
    status: "ready",
    summary: "UTF-8 テキストと Base64 を相互変換する。",
    description:
      "テキストを Base64 にエンコード、または Base64 文字列を元のテキストにデコードする。API トークンや添付データの確認に使える。",
    keywords: ["Base64", "エンコード", "デコード", "encode", "decode", "UTF-8", "バイナリ", "変換"],
    features: [
      "UTF-8 テキストを Base64 にエンコード",
      "Base64 文字列を UTF-8 テキストにデコード",
      "入出力のバイトサイズを表示",
      "空白を含む Base64 入力も自動トリム",
    ],
    cautions: [
      "UTF-8 テキストのみ対応しています。バイナリファイルの Base64 変換には対応していません。",
      "デコード結果が UTF-8 として解釈できない場合はエラーになります。",
      "末尾のパディング（=）は省略されていても処理できます。",
    ],
    faq: [
      {
        question: "画像ファイルの Base64 変換はできますか。",
        answer: "テキストベースの変換のみ対応しています。画像などのバイナリデータは専用ツールをご利用ください。",
      },
      {
        question: "URL-safe Base64 には対応していますか。",
        answer: "標準の Base64（+, /, =）のみ対応しています。URL-safe 変換（-, _）は行いません。",
      },
      {
        question: "大きなテキストも処理できますか。",
        answer: "ブラウザのメモリ内で処理するため、数 MB 程度までは問題なく動作します。",
      },
    ],
    inputFields: [
      { label: "テキスト", type: "text", value: "こんにちは世界", helpText: "エンコードするテキストまたはデコードする Base64 文字列" },
    ],
    resultPreview: "44GT44KT44Gr44Gh44Gv5LiW55WM",
    relatedArticleSlugs: ["base64-encoding"],
  },
  {
    slug: "regex-tester",
    name: "正規表現テスター",
    priority: "supporting",
    category: "text",
    status: "ready",
    summary: "正規表現のマッチとキャプチャグループをリアルタイムで確認する。",
    description:
      "入力した正規表現パターンをテスト文字列に適用し、マッチ位置・キャプチャグループ・フラグの効果をブラウザ内だけで確認する。",
    keywords: ["正規表現", "regex", "regexp", "パターン", "マッチ", "キャプチャ", "テスト", "グループ"],
    features: [
      "リアルタイムでマッチ結果を表示",
      "キャプチャグループ（$1, $2...）を確認",
      "g / i / m / s フラグの切り替え",
      "メールアドレス・日付・電話番号のプリセット付き",
    ],
    cautions: [
      "JavaScript の正規表現エンジンに準拠します。後読み（lookbehind）は一部のブラウザで未対応の場合があります。",
      "ゼロ幅マッチの無限ループ防止のため、マッチ数の上限は 1,000 件です。",
      "入力パターンに / の囲みは不要です。フラグはチェックボックスで指定してください。",
    ],
    faq: [
      {
        question: "Python や Java の正規表現と結果が異なる場合はありますか。",
        answer: "あります。エンジンごとに構文や挙動が異なるため、最終的には対象言語で検証してください。",
      },
      {
        question: "名前付きキャプチャ（?<name>）は使えますか。",
        answer: "JavaScript がサポートしているため使えます。ただし結果表示はインデックスベースです。",
      },
      {
        question: "置換（replace）機能はありますか。",
        answer: "現在はマッチ確認のみです。置換はテキストエディタの検索・置換機能をご利用ください。",
      },
    ],
    inputFields: [
      { label: "パターン", type: "text", value: "[\\w.+-]+@[\\w-]+\\.[\\w.]+", helpText: "正規表現パターン（/ の囲み不要）" },
      { label: "テスト文字列", type: "text", value: "連絡先: taro@example.com", helpText: "マッチ対象のテキスト" },
    ],
    resultPreview: '1 件マッチ: "taro@example.com" at index 4',
    relatedArticleSlugs: ["regex-basics"],
  },
  {
    slug: "sql-formatter",
    name: "SQLフォーマッター",
    priority: "supporting",
    category: "format",
    status: "ready",
    summary: "SQL を見やすく整形し、主要キーワードを読みやすい位置に並べる。",
    description:
      "SELECT、JOIN、WHERE、GROUP BY などの主要句を区切って SQL を読みやすく整形する。レビュー前のクエリ確認やログから取り出した SQL の見直しに使える。",
    keywords: ["SQL", "formatter", "整形", "SELECT", "JOIN", "WHERE", "クエリ", "pretty print"],
    features: [
      "SELECT / FROM / WHERE / ORDER BY など主要句で改行",
      "括弧内を段階的にインデント",
      "キーワードを大文字に統一",
      "1行 SQL をレビューしやすい形に整形",
    ],
    cautions: [
      "整形専用であり SQL の構文検証や実行計画の確認は行いません。",
      "ベンダー固有構文でも基本的な改行は行いますが、完全な構文理解はしていません。",
      "文字列リテラル内の内容は変更しませんが、特殊な方言では期待通りに整形されない場合があります。",
    ],
    faq: [
      {
        question: "PostgreSQL や MySQL の方言でも使えますか。",
        answer: "基本的な SELECT、JOIN、WHERE、ORDER BY などの整形は共通で行えます。方言固有の細かな構文までは厳密に解釈していません。",
      },
      {
        question: "SQL を圧縮する機能はありますか。",
        answer: "このツールは読みやすい整形を目的にしています。圧縮や minify は行いません。",
      },
      {
        question: "キーワードの大文字化は無効にできますか。",
        answer: "現状は主要キーワードを大文字に揃える動作です。テーブル名や文字列リテラルはそのまま保持します。",
      },
    ],
    inputFields: [
      { label: "SQL", type: "text", value: "select u.id, u.name from users u where u.status = 'active' order by u.id", helpText: "整形したい SQL を貼り付け" },
    ],
    resultPreview: "SELECT\\n  u.id,\\n  u.name\\nFROM users u\\nWHERE u.status = 'active'\\nORDER BY u.id",
  },
  {
    slug: "csv-json",
    name: "CSV ↔ JSON 変換",
    priority: "supporting",
    category: "convert",
    status: "ready",
    summary: "CSV と JSON の相互変換をブラウザ内だけで行う。",
    description:
      "ヘッダー付き CSV を JSON 配列へ、JSON 配列を CSV へ変換する。受け渡しデータの確認、簡易な加工、テスト用データ作成に使える。",
    keywords: ["CSV", "JSON", "変換", "convert", "header", "配列", "インポート", "エクスポート"],
    features: [
      "ヘッダー付き CSV を JSON 配列へ変換",
      "JSON 配列を CSV へ変換",
      "ダブルクォートや改行を含むセルをエスケープ",
      "区切り文字はカンマとタブに対応",
    ],
    cautions: [
      "CSV → JSON は先頭行をヘッダーとして扱います。ヘッダーなし CSV は想定していません。",
      "JSON → CSV はオブジェクト配列を前提にしています。単一値配列やネストが深い構造は文字列化されます。",
      "Excel 独自の表示形式や日付自動変換までは再現しません。",
    ],
    faq: [
      {
        question: "セル内にカンマや改行が含まれていても変換できますか。",
        answer: "ダブルクォートで囲まれた標準的な CSV であれば処理できます。JSON へ変換した後もセル内容は保持されます。",
      },
      {
        question: "TSV も扱えますか。",
        answer: "区切り文字をタブに切り替えることで TSV として使えます。",
      },
      {
        question: "JSON のネスト構造はどう出力されますか。",
        answer: "CSV は1セルに単一値しか持てないため、オブジェクトや配列は JSON 文字列として出力します。",
      },
    ],
    inputFields: [
      { label: "CSV", type: "text", value: "id,name,email\\n1,田中,tanaka@example.com\\n2,佐藤,sato@example.com", helpText: "ヘッダー付き CSV" },
    ],
    resultPreview: "[\\n  { \"id\": \"1\", \"name\": \"田中\", \"email\": \"tanaka@example.com\" },\\n  { \"id\": \"2\", \"name\": \"佐藤\", \"email\": \"sato@example.com\" }\\n]",
  },
  {
    slug: "json-to-ts",
    name: "JSON → TypeScript型生成",
    priority: "supporting",
    category: "convert",
    status: "ready",
    summary: "JSON から TypeScript の型定義の叩き台を生成する。",
    description:
      "JSON サンプルから TypeScript の type 定義を生成し、API レスポンスやフロント側 DTO のたたき台を素早く作る。配列やネストしたオブジェクトも型として展開する。",
    keywords: ["JSON", "TypeScript", "型生成", "type", "interface", "DTO", "schema", "frontend"],
    features: [
      "JSON オブジェクトから TypeScript 型を生成",
      "配列の要素型を推論",
      "null や複数型を union で表現",
      "ネストしたオブジェクトもそのまま展開",
    ],
    cautions: [
      "生成結果は叩き台です。optional 判定や命名整理はプロジェクト側で調整してください。",
      "異なる形のオブジェクトが混在する配列は union 型になるため、読みやすさを優先して手調整した方がよい場合があります。",
      "JSON Schema のような厳密なバリデーション定義は出力しません。",
    ],
    faq: [
      {
        question: "interface ではなく type になるのはなぜですか。",
        answer: "ネスト構造や union 型を一貫して扱いやすくするため、現状は type 定義で出力しています。",
      },
      {
        question: "配列内に異なる型が混在している場合はどうなりますか。",
        answer: "要素型をまとめて union 型として表現します。必要に応じて手動で整理してください。",
      },
      {
        question: "API の optional フィールドは判定できますか。",
        answer: "単一サンプル JSON だけでは optional かどうかは厳密に判断できません。複数レスポンスの揺れを踏まえて手調整する前提です。",
      },
    ],
    inputFields: [
      { label: "JSON", type: "text", value: '{"id":1,"name":"田中","active":true,"tags":["java","spring"],"profile":{"department":"開発","joinedAt":"2024-04-01"}}', helpText: "型の叩き台を作りたい JSON" },
    ],
    resultPreview: "type Root = {\\n  id: number\\n  name: string\\n  active: boolean\\n  tags: string[]\\n  profile: {\\n    department: string\\n    joinedAt: string\\n  }\\n}",
  },
  {
    slug: "hash",
    name: "ハッシュ生成",
    priority: "supporting",
    category: "security",
    status: "ready",
    summary: "テキストから SHA-256 / SHA-512 / SHA-1 / MD5 のハッシュ値を生成する。",
    description:
      "テキストを入力すると SHA-256・SHA-512・SHA-384・SHA-1・MD5 のハッシュ値を Hex と Base64 の両形式で即座に確認できる。パスワードハッシュの検算やファイル整合性チェックの事前確認に使える。",
    keywords: ["ハッシュ", "SHA-256", "SHA-512", "SHA-1", "MD5", "ダイジェスト", "チェックサム", "hash"],
    features: [
      "SHA-256 / SHA-512 / SHA-384 / SHA-1 / MD5 の5アルゴリズム対応",
      "結果を Hex と Base64 の両方で表示",
      "入力バイト数と出力バイト数を表示",
      "日本語（UTF-8 マルチバイト）のハッシュにも対応",
    ],
    cautions: [
      "MD5 と SHA-1 は衝突耐性が破られており、セキュリティ用途には推奨されません。チェックサムや後方互換目的での利用に留めてください。",
      "パスワードの保存には、このツールで生成する単純ハッシュではなく、PBKDF2 や bcrypt などのストレッチングハッシュを使ってください。",
      "ファイルのハッシュ値を計算する機能はありません。テキスト入力のみ対応しています。",
    ],
    faq: [
      {
        question: "SHA-256 と MD5 のどちらを使うべきですか。",
        answer: "セキュリティが求められる場面では SHA-256 以上を使ってください。MD5 は衝突攻撃が現実的なコストで可能なため、整合性チェックや既存システムとの互換用途に限定すべきです。",
      },
      {
        question: "同じ文字列なのにハッシュ値が他のツールと異なります。",
        answer: "文字エンコーディングの違いが原因です。このツールは UTF-8 でエンコードしたバイト列をハッシュ化します。Shift_JIS や Latin-1 で計算するツールとは結果が変わります。",
      },
      {
        question: "パスワードの保存にこのハッシュ値を使ってよいですか。",
        answer: "使わないでください。SHA-256 でも GPU で高速に総当たりできます。パスワード保存には PBKDF2・bcrypt・Argon2 などのストレッチングハッシュを使い、ユーザーごとにランダムなソルトを付けてください。",
      },
    ],
    inputFields: [
      { label: "テキスト", type: "text", value: "hello", helpText: "ハッシュ化したい文字列" },
    ],
    resultPreview: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    relatedArticleSlugs: ["password-hashing", "aes-encryption"],
  },
]

export const PRIORITY_TOOLS = TOOLS.filter((tool) => tool.priority === "priority")

export function getToolBySlug(slug: string) {
  return TOOLS.find((tool) => tool.slug === slug)
}

export function getToolHref(slug: string) {
  return `/tools/${slug}`
}
