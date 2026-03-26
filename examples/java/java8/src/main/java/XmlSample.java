import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamReader;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.helpers.DefaultHandler;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * XML の読み書きサンプル（Java 8+）。
 * DOM / SAX / StAX の 3 方式でパース、DOM で XML を生成します。
 */
public class XmlSample {

    // ---- DOM 方式: 読み込み ----

    /**
     * DOM でパース。ツリー全体をメモリに展開するため、小〜中規模向け。
     * ランダムアクセスや要素の追加・削除が可能。
     */
    public static List<Map<String, String>> parseWithDom(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new InputSource(new StringReader(xml)));
        doc.getDocumentElement().normalize();

        List<Map<String, String>> employees = new ArrayList<>();
        NodeList list = doc.getElementsByTagName("employee");
        for (int i = 0; i < list.getLength(); i++) {
            Element elem = (Element) list.item(i);
            Map<String, String> emp = new LinkedHashMap<>();
            emp.put("id", elem.getAttribute("id"));
            emp.put("name", getTextContent(elem, "name"));
            emp.put("department", getTextContent(elem, "department"));
            emp.put("salary", getTextContent(elem, "salary"));
            employees.add(emp);
        }
        return employees;
    }

    private static String getTextContent(Element parent, String tagName) {
        NodeList nodes = parent.getElementsByTagName(tagName);
        if (nodes.getLength() > 0) {
            return nodes.item(0).getTextContent();
        }
        return "";
    }

    // ---- DOM 方式: 書き込み ----

    /**
     * DOM で XML を生成し、文字列として返す。
     * Transformer を使って DOM ツリーを整形済み XML 文字列に変換する。
     */
    public static String buildWithDom(List<Map<String, String>> employees) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.newDocument();

        Element root = doc.createElement("employees");
        doc.appendChild(root);

        for (Map<String, String> emp : employees) {
            Element empElem = doc.createElement("employee");
            empElem.setAttribute("id", emp.get("id"));
            root.appendChild(empElem);

            Element nameElem = doc.createElement("name");
            nameElem.setTextContent(emp.get("name"));
            empElem.appendChild(nameElem);

            Element deptElem = doc.createElement("department");
            deptElem.setTextContent(emp.get("department"));
            empElem.appendChild(deptElem);

            Element salaryElem = doc.createElement("salary");
            salaryElem.setTextContent(emp.get("salary"));
            empElem.appendChild(salaryElem);
        }

        // DOM ツリーを XML 文字列に変換
        Transformer transformer = TransformerFactory.newInstance().newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
        StringWriter sw = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(sw));
        return sw.toString();
    }

    // ---- SAX 方式: 読み込み ----

    /**
     * SAX ハンドラー。イベント駆動で XML を読み込むため大容量ファイルに向く。
     * ツリーをメモリに展開しないので、GB 単位のファイルも処理可能。
     */
    private static class SaxEmployeeHandler extends DefaultHandler {
        final List<Map<String, String>> employees = new ArrayList<>();
        private Map<String, String> currentEmp;
        private final StringBuilder currentText = new StringBuilder();

        @Override
        public void startElement(String uri, String localName, String qName, Attributes attributes) {
            if ("employee".equals(qName)) {
                currentEmp = new LinkedHashMap<>();
                currentEmp.put("id", attributes.getValue("id"));
            }
            currentText.setLength(0); // テキストバッファをリセット
        }

        @Override
        public void characters(char[] ch, int start, int length) {
            // テキストノードは複数回に分割して呼ばれることがあるため append する
            currentText.append(ch, start, length);
        }

        @Override
        public void endElement(String uri, String localName, String qName) {
            if (currentEmp == null) {
                return;
            }
            String text = currentText.toString().trim();
            if ("name".equals(qName) || "department".equals(qName) || "salary".equals(qName)) {
                currentEmp.put(qName, text);
            }
            if ("employee".equals(qName)) {
                employees.add(currentEmp);
                currentEmp = null;
            }
        }
    }

    /**
     * SAX でパース。イベント駆動のため大容量 XML ファイルに適している。
     */
    public static List<Map<String, String>> parseWithSax(String xml) throws Exception {
        SAXParserFactory factory = SAXParserFactory.newInstance();
        SAXParser parser = factory.newSAXParser();
        SaxEmployeeHandler handler = new SaxEmployeeHandler();
        parser.parse(new InputSource(new StringReader(xml)), handler);
        return handler.employees;
    }

    // ---- StAX 方式: 読み込み ----

    /**
     * StAX でパース。カーソル型ストリームで読み進める方式。
     * SAX より直感的に書けて、DOM よりメモリ効率が高い。
     */
    public static List<Map<String, String>> parseWithStax(String xml) throws Exception {
        XMLInputFactory factory = XMLInputFactory.newInstance();
        XMLStreamReader reader = factory.createXMLStreamReader(new StringReader(xml));

        List<Map<String, String>> employees = new ArrayList<>();
        Map<String, String> currentEmp = null;
        String currentTag = null;

        while (reader.hasNext()) {
            int event = reader.next();

            if (event == XMLStreamConstants.START_ELEMENT) {
                String name = reader.getLocalName();
                if ("employee".equals(name)) {
                    currentEmp = new LinkedHashMap<>();
                    currentEmp.put("id", reader.getAttributeValue(null, "id"));
                }
                currentTag = name;

            } else if (event == XMLStreamConstants.CHARACTERS && currentEmp != null) {
                String text = reader.getText().trim();
                if (!text.isEmpty() && currentTag != null) {
                    if ("name".equals(currentTag) || "department".equals(currentTag)
                            || "salary".equals(currentTag)) {
                        currentEmp.put(currentTag, text);
                    }
                }

            } else if (event == XMLStreamConstants.END_ELEMENT) {
                if ("employee".equals(reader.getLocalName()) && currentEmp != null) {
                    employees.add(currentEmp);
                    currentEmp = null;
                }
                currentTag = null;
            }
        }
        reader.close();
        return employees;
    }

    public static void main(String[] args) throws Exception {
        String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            + "<employees>\n"
            + "  <employee id=\"1\">\n"
            + "    <name>Yamada Taro</name>\n"
            + "    <department>Development</department>\n"
            + "    <salary>450000</salary>\n"
            + "  </employee>\n"
            + "  <employee id=\"2\">\n"
            + "    <name>Suzuki Hanako</name>\n"
            + "    <department>Sales</department>\n"
            + "    <salary>380000</salary>\n"
            + "  </employee>\n"
            + "</employees>";

        System.out.println("=== DOM パース ===");
        for (Map<String, String> emp : parseWithDom(xml)) {
            System.out.println(emp);
        }

        System.out.println("\n=== SAX パース ===");
        for (Map<String, String> emp : parseWithSax(xml)) {
            System.out.println(emp);
        }

        System.out.println("\n=== StAX パース ===");
        for (Map<String, String> emp : parseWithStax(xml)) {
            System.out.println(emp);
        }

        System.out.println("\n=== DOM で XML 生成 ===");
        List<Map<String, String>> newEmps = new ArrayList<>();
        Map<String, String> emp = new LinkedHashMap<>();
        emp.put("id", "3");
        emp.put("name", "Tanaka Jiro");
        emp.put("department", "HR");
        emp.put("salary", "350000");
        newEmps.add(emp);
        System.out.println(buildWithDom(newEmps));
    }
}
