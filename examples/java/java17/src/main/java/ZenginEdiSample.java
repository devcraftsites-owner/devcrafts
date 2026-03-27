import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

/**
 * ZEDI（全銀EDIシステム）XML 電文の生成・パース サンプル（Java 17 版）。
 *
 * ISO 20022 ベースの XML メッセージフォーマットに準拠し、
 * 振込付帯情報（請求書番号・支払通知番号など）を XML で送受信する。
 *
 * Java 17 の特徴:
 * - record でパース結果を型安全に保持（不変性を保証）
 * - var による型推論で DOM 操作の冗長さを軽減
 * - テキストブロックでサンプル XML を可読性高く記述可能
 */
public class ZenginEdiSample {

    // --- ZEDI 名前空間定義 ---
    // ISO 20022 pain.001（顧客振込指図）の名前空間 URI
    private static final String ZEDI_NS = "urn:iso:std:iso:20022:tech:xsd:pain.001.001.03";

    /**
     * ZEDI 電文から抽出した振込付帯情報を保持する record。
     * record は不変で equals/hashCode/toString が自動生成されるため、
     * パース結果の受け渡しやログ出力に適している。
     */
    record ZediRemittanceInfo(
        String invoiceNumber,    // 請求書番号（RfrdDocInf/Nb）
        long amount,             // 振込金額（InstdAmt）
        String currency,         // 通貨コード（InstdAmt/@Ccy）
        String payeeName,        // 受取人名（Cdtr/Nm）
        String additionalInfo    // 追加付帯情報（AddtlRmtInf）
    ) {}

    /**
     * ZEDI XML 電文を DOM API で生成する。
     * var によって DocumentBuilderFactory や Transformer の型宣言が簡潔になる。
     */
    public static String buildZediMessage(
            String invoiceNumber,
            long paymentAmount,
            String payerName,
            String payeeName,
            String paymentNoticeId) throws Exception {

        // var で DOM ファクトリ・ビルダーの生成を簡潔に
        var factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);  // 名前空間を有効化（ZEDI 必須）
        var doc = factory.newDocumentBuilder().newDocument();

        // Document ルート要素（ISO 20022 メッセージのエンベロープ）
        var root = doc.createElementNS(ZEDI_NS, "Document");
        doc.appendChild(root);

        // CstmrCdtTrfInitn: 顧客振込指図
        var initiation = doc.createElementNS(ZEDI_NS, "CstmrCdtTrfInitn");
        root.appendChild(initiation);

        // GrpHdr: グループヘッダー
        var grpHdr = doc.createElementNS(ZEDI_NS, "GrpHdr");
        initiation.appendChild(grpHdr);
        var msgId = doc.createElementNS(ZEDI_NS, "MsgId");
        msgId.setTextContent("MSG-" + System.currentTimeMillis());
        grpHdr.appendChild(msgId);

        // PmtInf: 支払情報ブロック
        var pmtInf = doc.createElementNS(ZEDI_NS, "PmtInf");
        initiation.appendChild(pmtInf);

        // Dbtr: 支払人
        var dbtr = doc.createElementNS(ZEDI_NS, "Dbtr");
        pmtInf.appendChild(dbtr);
        appendTextElement(doc, dbtr, "Nm", payerName);

        // CdtTrfTxInf: 個別振込取引情報
        var txInf = doc.createElementNS(ZEDI_NS, "CdtTrfTxInf");
        pmtInf.appendChild(txInf);

        // Amt/InstdAmt: 振込金額（通貨属性付き）
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

        // RmtInf: 付帯情報（ZEDI の核心）
        var rmtInf = doc.createElementNS(ZEDI_NS, "RmtInf");
        txInf.appendChild(rmtInf);
        var strd = doc.createElementNS(ZEDI_NS, "Strd");
        rmtInf.appendChild(strd);

        // RfrdDocInf/Nb: 請求書番号
        var rfrdDocInf = doc.createElementNS(ZEDI_NS, "RfrdDocInf");
        strd.appendChild(rfrdDocInf);
        appendTextElement(doc, rfrdDocInf, "Nb", invoiceNumber);

        // AddtlRmtInf: 支払通知番号などの追加情報
        appendTextElement(doc, strd, "AddtlRmtInf", "PaymentNotice:" + paymentNoticeId);

        // XML 文字列に変換
        var transformer = TransformerFactory.newInstance().newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        var writer = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        return writer.toString();
    }

    /** 名前空間付きテキスト要素を追加するヘルパー */
    private static void appendTextElement(Document doc, Element parent, String localName, String text) {
        var elem = doc.createElementNS(ZEDI_NS, localName);
        elem.setTextContent(text);
        parent.appendChild(elem);
    }

    /**
     * ZEDI XML 電文をパースし、record のリストとして返す。
     * Java 17 では record + var の組み合わせでパース結果を簡潔かつ型安全に扱える。
     */
    public static List<ZediRemittanceInfo> parseZediMessage(String xml) throws Exception {
        var factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);

        // XXE 対策: DTD と外部エンティティを無効化
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);

        var doc = factory.newDocumentBuilder()
                .parse(new InputSource(new StringReader(xml)));
        doc.getDocumentElement().normalize();

        var results = new ArrayList<ZediRemittanceInfo>();

        // 名前空間付きで CdtTrfTxInf 要素を取得
        var txNodes = doc.getElementsByTagNameNS(ZEDI_NS, "CdtTrfTxInf");

        for (int i = 0; i < txNodes.getLength(); i++) {
            var txElem = (Element) txNodes.item(i);

            // 各フィールドを名前空間付きで安全に取得
            var amount = getTextNS(txElem, "InstdAmt");
            var currency = getAttributeNS(txElem, "InstdAmt", "Ccy");
            var payeeName = getNestedTextNS(txElem, "Cdtr", "Nm");
            var invoiceNumber = getTextNS(txElem, "Nb");
            var additionalInfo = getTextNS(txElem, "AddtlRmtInf");

            // record コンストラクタでパース結果を不変オブジェクトに格納
            results.add(new ZediRemittanceInfo(
                    invoiceNumber,
                    amount.isEmpty() ? 0L : Long.parseLong(amount),
                    currency,
                    payeeName,
                    additionalInfo
            ));
        }
        return results;
    }

    /** 名前空間付き要素のテキストを取得するユーティリティ */
    private static String getTextNS(Element parent, String localName) {
        var nodes = parent.getElementsByTagNameNS(ZEDI_NS, localName);
        return nodes.getLength() > 0 ? nodes.item(0).getTextContent() : "";
    }

    /** 名前空間付き要素の属性値を取得するユーティリティ */
    private static String getAttributeNS(Element parent, String localName, String attrName) {
        var nodes = parent.getElementsByTagNameNS(ZEDI_NS, localName);
        return nodes.getLength() > 0 ? ((Element) nodes.item(0)).getAttribute(attrName) : "";
    }

    /** ネストされた名前空間付き要素のテキストを取得するユーティリティ */
    private static String getNestedTextNS(Element parent, String outerName, String innerName) {
        var outerNodes = parent.getElementsByTagNameNS(ZEDI_NS, outerName);
        if (outerNodes.getLength() > 0) {
            var outerElem = (Element) outerNodes.item(0);
            var innerNodes = outerElem.getElementsByTagNameNS(ZEDI_NS, innerName);
            return innerNodes.getLength() > 0 ? innerNodes.item(0).getTextContent() : "";
        }
        return "";
    }

    public static void main(String[] args) throws Exception {
        // ZEDI 電文を生成
        var xml = buildZediMessage(
                "INV-2025-001234",     // 請求書番号
                1500000L,              // 支払金額（150万円）
                "株式会社サンプル商事",   // 支払人名
                "株式会社テスト工業",     // 受取人名
                "PN-2025-00567"        // 支払通知番号
        );
        System.out.println("=== 生成した ZEDI XML ===");
        System.out.println(xml);

        // 生成した XML をパースし、record として取得
        var remittanceList = parseZediMessage(xml);
        System.out.println("=== パース結果（record） ===");
        // record の toString() が自動的にフィールド名と値を出力する
        remittanceList.forEach(System.out::println);
    }
}
