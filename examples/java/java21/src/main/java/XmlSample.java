import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamReader;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.helpers.DefaultHandler;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

/**
 * XML の読み書きサンプル（Java 21+）。
 * sealed interface + パターンマッチングで SAX イベントを型安全に処理。
 */
public class XmlSample {

    record Employee(String id, String name, String department, int salary) {}

    // SAX イベントを sealed interface で型安全にモデル化（Java 21+）
    sealed interface XmlEvent {
        record Start(String tag, String id) implements XmlEvent {}
        record Text(String content)         implements XmlEvent {}
        record End(String tag)              implements XmlEvent {}
    }

    // ---- DOM 方式 ----

    public static List<Employee> parseWithDom(String xml) throws Exception {
        var doc = DocumentBuilderFactory.newInstance()
                .newDocumentBuilder()
                .parse(new InputSource(new StringReader(xml)));
        doc.getDocumentElement().normalize();

        var employees = new ArrayList<Employee>();
        var list = doc.getElementsByTagName("employee");
        for (int i = 0; i < list.getLength(); i++) {
            var elem = (Element) list.item(i);
            employees.add(new Employee(
                elem.getAttribute("id"),
                elem.getElementsByTagName("name").item(0).getTextContent(),
                elem.getElementsByTagName("department").item(0).getTextContent(),
                Integer.parseInt(elem.getElementsByTagName("salary").item(0).getTextContent())
            ));
        }
        return employees;
    }

    public static String buildWithDom(List<Employee> employees) throws Exception {
        var builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
        var doc = builder.newDocument();
        var root = doc.createElement("employees");
        doc.appendChild(root);

        for (var emp : employees) {
            var e = doc.createElement("employee");
            e.setAttribute("id", emp.id());
            root.appendChild(e);
            appendText(doc, e, "name",       emp.name());
            appendText(doc, e, "department", emp.department());
            appendText(doc, e, "salary",     String.valueOf(emp.salary()));
        }

        var transformer = TransformerFactory.newInstance().newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
        var sw = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(sw));
        return sw.toString();
    }

    private static void appendText(Document doc, Element parent, String tag, String text) {
        var elem = doc.createElement(tag);
        elem.setTextContent(text);
        parent.appendChild(elem);
    }

    // ---- SAX 方式（sealed interface + パターンマッチング） ----

    /**
     * SAX ハンドラーで XmlEvent リストを収集し、
     * パターンマッチングで状態遷移をわかりやすく記述する。
     */
    private static class EventCollector extends DefaultHandler {
        final List<XmlEvent> events = new ArrayList<>();

        @Override
        public void startElement(String u, String l, String qName, Attributes attrs) {
            events.add(new XmlEvent.Start(qName, attrs.getValue("id")));
        }

        @Override
        public void characters(char[] ch, int start, int length) {
            var text = new String(ch, start, length).trim();
            if (!text.isEmpty()) {
                events.add(new XmlEvent.Text(text));
            }
        }

        @Override
        public void endElement(String u, String l, String qName) {
            events.add(new XmlEvent.End(qName));
        }
    }

    public static List<Employee> parseWithSax(String xml) throws Exception {
        var factory = SAXParserFactory.newInstance();
        var parser = factory.newSAXParser();
        var collector = new EventCollector();
        parser.parse(new InputSource(new StringReader(xml)), collector);

        // パターンマッチングで各イベントを処理（Java 21+）
        var employees = new ArrayList<Employee>();
        String id = null, name = null, dept = null, salary = null;
        String lastTag = null;

        for (var event : collector.events) {
            switch (event) {
                case XmlEvent.Start(var tag, var attrId) -> {
                    if ("employee".equals(tag)) {
                        id = attrId;
                        name = dept = salary = null;
                    }
                    lastTag = tag;
                }
                case XmlEvent.Text(var content) -> {
                    // when ガード節では再代入変数を参照できないため if で条件分岐
                    if (id != null && lastTag != null) {
                        switch (lastTag) {
                            case "name"       -> name   = content;
                            case "department" -> dept   = content;
                            case "salary"     -> salary = content;
                        }
                    }
                }
                case XmlEvent.End(var tag) -> {
                    if ("employee".equals(tag) && id != null) {
                        employees.add(new Employee(id, name, dept, Integer.parseInt(salary)));
                        id = null;
                    }
                }
                default -> {} // その他のイベントは無視
            }
        }
        return employees;
    }

    // ---- StAX 方式 ----

    public static List<Employee> parseWithStax(String xml) throws Exception {
        var factory = XMLInputFactory.newInstance();
        XMLStreamReader reader = factory.createXMLStreamReader(new StringReader(xml));

        var employees = new ArrayList<Employee>();
        String id = null, name = null, dept = null, salary = null;
        String currentTag = null;

        while (reader.hasNext()) {
            switch (reader.next()) {
                case XMLStreamConstants.START_ELEMENT -> {
                    if ("employee".equals(reader.getLocalName())) {
                        id = reader.getAttributeValue(null, "id");
                        name = dept = salary = null;
                    }
                    currentTag = reader.getLocalName();
                }
                case XMLStreamConstants.CHARACTERS -> {
                    var text = reader.getText().trim();
                    if (!text.isEmpty() && id != null && currentTag != null) {
                        switch (currentTag) {
                            case "name"       -> name   = text;
                            case "department" -> dept   = text;
                            case "salary"     -> salary = text;
                        }
                    }
                }
                case XMLStreamConstants.END_ELEMENT -> {
                    if ("employee".equals(reader.getLocalName()) && id != null) {
                        employees.add(new Employee(id, name, dept, Integer.parseInt(salary)));
                        id = null;
                    }
                    currentTag = null;
                }
            }
        }
        reader.close();
        return employees;
    }

    public static void main(String[] args) throws Exception {
        String xml = """
                <?xml version="1.0" encoding="UTF-8"?>
                <employees>
                  <employee id="1">
                    <name>Yamada Taro</name>
                    <department>Development</department>
                    <salary>450000</salary>
                  </employee>
                  <employee id="2">
                    <name>Suzuki Hanako</name>
                    <department>Sales</department>
                    <salary>380000</salary>
                  </employee>
                </employees>
                """;

        System.out.println("=== DOM パース ===");
        parseWithDom(xml).forEach(System.out::println);

        System.out.println("\n=== SAX パース（sealed interface + パターンマッチング）===");
        parseWithSax(xml).forEach(System.out::println);

        System.out.println("\n=== StAX パース ===");
        parseWithStax(xml).forEach(System.out::println);

        System.out.println("\n=== DOM で XML 生成 ===");
        System.out.println(buildWithDom(List.of(new Employee("3", "Tanaka Jiro", "HR", 350000))));
    }
}
