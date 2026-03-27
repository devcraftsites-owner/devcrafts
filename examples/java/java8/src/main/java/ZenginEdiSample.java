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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ZEDI（全銀EDIシステム）XML 電文の生成・パース サンプル（Java 8 版）。
 *
 * ISO 20022 ベースの XML メッセージフォーマットに基づき、
 * 振込付帯情報（請求書番号・支払通知番号など）を XML で送受信する例を示す。
 *
 * Java 8 では var が使えないため、すべての変数に明示的な型宣言が必要。
 * データ保持には Map を使用する（record は Java 16 以降）。
 */
public class ZenginEdiSample {

    // --- ZEDI 名前空間定義 ---
    // ISO 20022 の pain.001（振込指図）に準じた名前空間 URI
    private static final String ZEDI_NS = "urn:iso:std:iso:20022:tech:xsd:pain.001.001.03";

    /**
     * ZEDI XML 電文を DOM API で生成する。
     * DOM はツリー全体をメモリに保持するため、電文1件ずつの生成に適している。
     *
     * @param invoiceNumber   請求書番号（付帯情報の主キー）
     * @param paymentAmount   支払金額
     * @param payerName       支払人名
     * @param payeeName       受取人名
     * @param paymentNoticeId 支払通知番号
     * @return 生成された XML 文字列
     */
    public static String buildZediMessage(
            String invoiceNumber,
            long paymentAmount,
            String payerName,
            String payeeName,
            String paymentNoticeId) throws Exception {

        // DocumentBuilderFactory でパーサーを生成
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        // 名前空間を有効にする（ZEDI は名前空間付き XML）
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.newDocument();

        // ルート要素: Document（ISO 20022 のメッセージルート）
        // 名前空間 URI を指定して要素を作成する
        Element root = doc.createElementNS(ZEDI_NS, "Document");
        doc.appendChild(root);

        // CstmrCdtTrfInitn: 顧客振込指図の開始要素
        Element initiation = doc.createElementNS(ZEDI_NS, "CstmrCdtTrfInitn");
        root.appendChild(initiation);

        // GrpHdr: グループヘッダー（電文の識別情報）
        Element grpHdr = doc.createElementNS(ZEDI_NS, "GrpHdr");
        initiation.appendChild(grpHdr);

        // MsgId: メッセージID（電文を一意に識別する）
        Element msgId = doc.createElementNS(ZEDI_NS, "MsgId");
        msgId.setTextContent("MSG-" + System.currentTimeMillis());
        grpHdr.appendChild(msgId);

        // PmtInf: 支払情報ブロック（1つの振込指図に対応）
        Element pmtInf = doc.createElementNS(ZEDI_NS, "PmtInf");
        initiation.appendChild(pmtInf);

        // Dbtr: 支払人（Debtor）情報
        Element dbtr = doc.createElementNS(ZEDI_NS, "Dbtr");
        pmtInf.appendChild(dbtr);
        Element dbtrName = doc.createElementNS(ZEDI_NS, "Nm");
        dbtrName.setTextContent(payerName);
        dbtr.appendChild(dbtrName);

        // CdtTrfTxInf: 個別の振込取引情報
        Element txInf = doc.createElementNS(ZEDI_NS, "CdtTrfTxInf");
        pmtInf.appendChild(txInf);

        // Amt: 振込金額
        Element amt = doc.createElementNS(ZEDI_NS, "Amt");
        txInf.appendChild(amt);
        Element instdAmt = doc.createElementNS(ZEDI_NS, "InstdAmt");
        // Ccy 属性: 通貨コード（日本円は JPY）
        instdAmt.setAttribute("Ccy", "JPY");
        instdAmt.setTextContent(String.valueOf(paymentAmount));
        amt.appendChild(instdAmt);

        // Cdtr: 受取人（Creditor）情報
        Element cdtr = doc.createElementNS(ZEDI_NS, "Cdtr");
        txInf.appendChild(cdtr);
        Element cdtrName = doc.createElementNS(ZEDI_NS, "Nm");
        cdtrName.setTextContent(payeeName);
        cdtr.appendChild(cdtrName);

        // RmtInf: 付帯情報（Remittance Information）— ZEDI の核心部分
        // ここに請求書番号や支払通知番号を格納する
        Element rmtInf = doc.createElementNS(ZEDI_NS, "RmtInf");
        txInf.appendChild(rmtInf);

        // Strd: 構造化された付帯情報
        Element strd = doc.createElementNS(ZEDI_NS, "Strd");
        rmtInf.appendChild(strd);

        // RfrdDocInf: 参照ドキュメント情報（請求書番号を格納）
        Element rfrdDocInf = doc.createElementNS(ZEDI_NS, "RfrdDocInf");
        strd.appendChild(rfrdDocInf);
        Element nbr = doc.createElementNS(ZEDI_NS, "Nb");
        nbr.setTextContent(invoiceNumber);
        rfrdDocInf.appendChild(nbr);

        // AddtlRmtInf: 追加付帯情報（支払通知番号など自由記述）
        Element addtlRmtInf = doc.createElementNS(ZEDI_NS, "AddtlRmtInf");
        addtlRmtInf.setTextContent("PaymentNotice:" + paymentNoticeId);
        strd.appendChild(addtlRmtInf);

        // XML 文字列に変換（Transformer を使用）
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        // インデント付きで出力（可読性のため）
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        // エンコーディングを UTF-8 に明示指定
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        // XML 宣言を含める
        transformer.setOutputProperty(OutputKeys.STANDALONE, "yes");

        StringWriter writer = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        return writer.toString();
    }

    /**
     * ZEDI XML 電文をパースし、付帯情報を抽出する。
     * Java 8 では Map で結果を返す（record が使えないため）。
     */
    public static List<Map<String, String>> parseZediMessage(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);

        // XXE 対策: 外部エンティティ参照を無効化
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);

        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new InputSource(new StringReader(xml)));
        doc.getDocumentElement().normalize();

        List<Map<String, String>> results = new ArrayList<>();

        // CdtTrfTxInf 要素（個別振込取引）を名前空間付きで取得
        NodeList txNodes = doc.getElementsByTagNameNS(ZEDI_NS, "CdtTrfTxInf");

        for (int i = 0; i < txNodes.getLength(); i++) {
            Element txElem = (Element) txNodes.item(i);
            Map<String, String> record = new HashMap<>();

            // 振込金額の取得
            NodeList amtNodes = txElem.getElementsByTagNameNS(ZEDI_NS, "InstdAmt");
            if (amtNodes.getLength() > 0) {
                record.put("amount", amtNodes.item(0).getTextContent());
                record.put("currency", ((Element) amtNodes.item(0)).getAttribute("Ccy"));
            }

            // 受取人名の取得
            NodeList cdtrNodes = txElem.getElementsByTagNameNS(ZEDI_NS, "Cdtr");
            if (cdtrNodes.getLength() > 0) {
                Element cdtrElem = (Element) cdtrNodes.item(0);
                NodeList nmNodes = cdtrElem.getElementsByTagNameNS(ZEDI_NS, "Nm");
                if (nmNodes.getLength() > 0) {
                    record.put("payeeName", nmNodes.item(0).getTextContent());
                }
            }

            // 付帯情報（請求書番号）の取得
            NodeList nbNodes = txElem.getElementsByTagNameNS(ZEDI_NS, "Nb");
            if (nbNodes.getLength() > 0) {
                record.put("invoiceNumber", nbNodes.item(0).getTextContent());
            }

            // 追加付帯情報の取得
            NodeList addtlNodes = txElem.getElementsByTagNameNS(ZEDI_NS, "AddtlRmtInf");
            if (addtlNodes.getLength() > 0) {
                record.put("additionalInfo", addtlNodes.item(0).getTextContent());
            }

            results.add(record);
        }
        return results;
    }

    public static void main(String[] args) throws Exception {
        // ZEDI 電文を生成
        String xml = buildZediMessage(
                "INV-2025-001234",   // 請求書番号
                1500000L,            // 支払金額（150万円）
                "株式会社サンプル商事", // 支払人名
                "株式会社テスト工業",   // 受取人名
                "PN-2025-00567"      // 支払通知番号
        );
        System.out.println("=== 生成した ZEDI XML ===");
        System.out.println(xml);

        // 生成した XML をパース
        List<Map<String, String>> parsed = parseZediMessage(xml);
        System.out.println("=== パース結果 ===");
        for (Map<String, String> record : parsed) {
            System.out.println("請求書番号: " + record.get("invoiceNumber"));
            System.out.println("支払金額: " + record.get("amount") + " " + record.get("currency"));
            System.out.println("受取人: " + record.get("payeeName"));
            System.out.println("追加情報: " + record.get("additionalInfo"));
        }
    }
}
