import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamReader;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

/**
 * ZEDI（全銀EDIシステム）XML 電文の生成・パース サンプル（Java 21 版）。
 *
 * ISO 20022 ベースの XML メッセージフォーマットに準拠。
 *
 * Java 21 の特徴:
 * - sealed interface + record で XML ノードの型を安全にモデル化
 * - switch 式のパターンマッチングで XML イベント処理を型安全に分岐
 * - StAX パーサーとの組み合わせでイベント駆動パースを直感的に記述
 */
public class ZenginEdiSample {

    // --- ZEDI 名前空間定義 ---
    private static final String ZEDI_NS = "urn:iso:std:iso:20022:tech:xsd:pain.001.001.03";

    /**
     * ZEDI 電文の付帯情報を保持する record。
     */
    record ZediRemittanceInfo(
        String invoiceNumber,
        long amount,
        String currency,
        String payeeName,
        String additionalInfo
    ) {}

    /**
     * StAX パースで検出した XML イベントを sealed interface でモデル化する。
     * Java 21 のパターンマッチングと組み合わせることで、
     * イベントの種別ごとに型安全な分岐処理が書ける。
     */
    sealed interface ZediXmlEvent {
        /** 要素開始イベント（タグ名と属性値を保持） */
        record StartElement(String localName, String currencyAttr) implements ZediXmlEvent {}
        /** テキストノードイベント */
        record Characters(String text) implements ZediXmlEvent {}
        /** 要素終了イベント */
        record EndElement(String localName) implements ZediXmlEvent {}
    }

    /**
     * ZEDI XML 電文を DOM API で生成する（生成側は DOM が適している）。
     * DOM はツリーを自由に構築・操作できるため、電文の組み立てに向く。
     */
    public static String buildZediMessage(
            String invoiceNumber,
            long paymentAmount,
            String payerName,
            String payeeName,
            String paymentNoticeId) throws Exception {

        var factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        var doc = factory.newDocumentBuilder().newDocument();

        // Document ルート要素
        var root = doc.createElementNS(ZEDI_NS, "Document");
        doc.appendChild(root);

        // CstmrCdtTrfInitn: 顧客振込指図
        var initiation = doc.createElementNS(ZEDI_NS, "CstmrCdtTrfInitn");
        root.appendChild(initiation);

        // GrpHdr: グループヘッダー
        var grpHdr = doc.createElementNS(ZEDI_NS, "GrpHdr");
        initiation.appendChild(grpHdr);
        appendTextElement(doc, grpHdr, "MsgId", "MSG-" + System.currentTimeMillis());

        // PmtInf: 支払情報
        var pmtInf = doc.createElementNS(ZEDI_NS, "PmtInf");
        initiation.appendChild(pmtInf);

        // Dbtr: 支払人
        var dbtr = doc.createElementNS(ZEDI_NS, "Dbtr");
        pmtInf.appendChild(dbtr);
        appendTextElement(doc, dbtr, "Nm", payerName);

        // CdtTrfTxInf: 個別振込取引情報
        var txInf = doc.createElementNS(ZEDI_NS, "CdtTrfTxInf");
        pmtInf.appendChild(txInf);

        // Amt/InstdAmt: 振込金額
        var amt = doc.createElementNS(ZEDI_NS, "Amt");
        txInf.appendChild(amt);
        var instdAmt = doc.createElementNS(ZEDI_NS, "InstdAmt");
        instdAmt.setAttribute("Ccy", "JPY");
        instdAmt.setTextContent(String.valueOf(paymentAmount));
        amt.appendChild(instdAmt);

        // Cdtr: 受取人
        var cdtr = doc.createElementNS(ZEDI_NS, "Cdtr");
        txInf.appendChild(cdtr);
        appendTextElement(doc, cdtr, "Nm", payeeName);

        // RmtInf: 付帯情報
        var rmtInf = doc.createElementNS(ZEDI_NS, "RmtInf");
        txInf.appendChild(rmtInf);
        var strd = doc.createElementNS(ZEDI_NS, "Strd");
        rmtInf.appendChild(strd);
        var rfrdDocInf = doc.createElementNS(ZEDI_NS, "RfrdDocInf");
        strd.appendChild(rfrdDocInf);
        appendTextElement(doc, rfrdDocInf, "Nb", invoiceNumber);
        appendTextElement(doc, strd, "AddtlRmtInf", "PaymentNotice:" + paymentNoticeId);

        // XML 変換
        var transformer = TransformerFactory.newInstance().newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        var writer = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        return writer.toString();
    }

    private static void appendTextElement(Document doc, Element parent, String localName, String text) {
        var elem = doc.createElementNS(ZEDI_NS, localName);
        elem.setTextContent(text);
        parent.appendChild(elem);
    }

    /**
     * StAX で ZEDI XML をイベントとして読み取り、sealed interface で型付けする。
     * Java 21 のパターンマッチング switch で、各イベントに対する処理を直感的に記述できる。
     *
     * StAX は大容量の XML でもメモリ効率がよく、
     * 複数電文を連続処理する業務バッチに適している。
     */
    public static List<ZediRemittanceInfo> parseWithStAX(String xml) throws Exception {
        var xmlFactory = XMLInputFactory.newInstance();
        // XXE 対策: 外部エンティティを無効化
        xmlFactory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
        xmlFactory.setProperty(XMLInputFactory.SUPPORT_DTD, false);

        var reader = xmlFactory.createXMLStreamReader(new StringReader(xml));

        // まず StAX イベントを sealed interface のリストに変換する
        var events = new ArrayList<ZediXmlEvent>();
        while (reader.hasNext()) {
            // switch 式で StAX のイベント定数をパターンマッチング
            switch (reader.next()) {
                case XMLStreamConstants.START_ELEMENT -> {
                    var localName = reader.getLocalName();
                    // InstdAmt の Ccy 属性を取得（通貨コード）
                    var ccyAttr = "InstdAmt".equals(localName)
                            ? reader.getAttributeValue(null, "Ccy")
                            : "";
                    events.add(new ZediXmlEvent.StartElement(localName, ccyAttr != null ? ccyAttr : ""));
                }
                case XMLStreamConstants.CHARACTERS -> {
                    var text = reader.getText().trim();
                    if (!text.isEmpty()) {
                        events.add(new ZediXmlEvent.Characters(text));
                    }
                }
                case XMLStreamConstants.END_ELEMENT ->
                    events.add(new ZediXmlEvent.EndElement(reader.getLocalName()));
                default -> { /* COMMENT, PROCESSING_INSTRUCTION 等はスキップ */ }
            }
        }
        reader.close();

        // sealed interface のイベントリストから付帯情報を抽出する
        return extractRemittanceInfo(events);
    }

    /**
     * sealed interface でモデル化されたイベント列から、付帯情報を抽出する。
     * Java 21 の switch パターンマッチングにより、
     * イベント型ごとの処理が網羅的かつ型安全に書ける。
     */
    private static List<ZediRemittanceInfo> extractRemittanceInfo(List<ZediXmlEvent> events) {
        var results = new ArrayList<ZediRemittanceInfo>();
        String currentTag = "";
        String currency = "";
        String invoiceNumber = "";
        long amount = 0L;
        String payeeName = "";
        String additionalInfo = "";
        boolean inCdtTrfTxInf = false;

        for (var event : events) {
            // パターンマッチングで各イベント型に応じた処理を分岐
            switch (event) {
                case ZediXmlEvent.StartElement(var name, var ccyAttr) -> {
                    currentTag = name;
                    if ("CdtTrfTxInf".equals(name)) {
                        // 振込取引情報ブロックの開始 — フィールドをリセット
                        inCdtTrfTxInf = true;
                        invoiceNumber = "";
                        amount = 0L;
                        currency = "";
                        payeeName = "";
                        additionalInfo = "";
                    }
                    if ("InstdAmt".equals(name) && !ccyAttr.isEmpty()) {
                        currency = ccyAttr;
                    }
                }
                case ZediXmlEvent.Characters(var text) when inCdtTrfTxInf -> {
                    // when ガードで取引情報内のテキストだけを処理対象にする
                    switch (currentTag) {
                        case "InstdAmt"    -> amount = Long.parseLong(text);
                        case "Nb"          -> invoiceNumber = text;
                        case "AddtlRmtInf" -> additionalInfo = text;
                        case "Nm"          -> payeeName = text;
                        default -> { /* 他のテキストは無視 */ }
                    }
                }
                case ZediXmlEvent.Characters _ -> { /* 取引情報外のテキストは無視 */ }
                case ZediXmlEvent.EndElement(var name) when "CdtTrfTxInf".equals(name) -> {
                    // 振込取引情報ブロックの終了 — record に格納
                    results.add(new ZediRemittanceInfo(
                            invoiceNumber, amount, currency, payeeName, additionalInfo));
                    inCdtTrfTxInf = false;
                }
                case ZediXmlEvent.EndElement _ -> { /* 他の終了タグは無視 */ }
            }
        }
        return results;
    }

    public static void main(String[] args) throws Exception {
        // ZEDI 電文を DOM で生成
        var xml = buildZediMessage(
                "INV-2025-001234",
                1500000L,
                "株式会社サンプル商事",
                "株式会社テスト工業",
                "PN-2025-00567"
        );
        System.out.println("=== 生成した ZEDI XML ===");
        System.out.println(xml);

        // StAX + sealed interface でパース
        var remittanceList = parseWithStAX(xml);
        System.out.println("=== パース結果（sealed interface + パターンマッチング） ===");
        remittanceList.forEach(info -> {
            System.out.println("請求書番号: " + info.invoiceNumber());
            System.out.println("支払金額: " + info.amount() + " " + info.currency());
            System.out.println("受取人: " + info.payeeName());
            System.out.println("追加情報: " + info.additionalInfo());
        });
    }
}
