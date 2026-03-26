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
 * XML の読み書きサンプル（Java 17+）。
 * record 型・テキストブロック・var を活用したコード。
 */
public class XmlSample {

    // record を使った型安全な Employee 表現（Java 16+）
    record Employee(String id, String name, String department, int salary) {}

    // ---- DOM 方式: 読み込み ----

    /**
     * DOM でパース。Java 17 では var でローカル変数を簡潔に書ける。
     */
    public static List<Employee> parseWithDom(String xml) throws Exception {
        var factory = DocumentBuilderFactory.newInstance();
        var builder = factory.newDocumentBuilder();
        var doc = builder.parse(new InputSource(new StringReader(xml)));
        doc.getDocumentElement().normalize();

        var employees = new ArrayList<Employee>();
        var list = doc.getElementsByTagName("employee");
        for (int i = 0; i < list.getLength(); i++) {
            var elem = (Element) list.item(i);
            employees.add(new Employee(
                elem.getAttribute("id"),
                getTextContent(elem, "name"),
                getTextContent(elem, "department"),
                Integer.parseInt(getTextContent(elem, "salary"))
            ));
        }
        return employees;
    }

    private static String getTextContent(Element parent, String tagName) {
        NodeList nodes = parent.getElementsByTagName(tagName);
        return nodes.getLength() > 0 ? nodes.item(0).getTextContent() : "";
    }

    // ---- DOM 方式: 書き込み ----

    /**
     * DOM で XML を生成。テキストブロックでサンプル XML をリーダブルに記述。
     */
    public static String buildWithDom(List<Employee> employees) throws Exception {
        var factory = DocumentBuilderFactory.newInstance();
        var builder = factory.newDocumentBuilder();
        var doc = builder.newDocument();

        var root = doc.createElement("employees");
        doc.appendChild(root);

        for (var emp : employees) {
            var empElem = doc.createElement("employee");
            empElem.setAttribute("id", emp.id());
            root.appendChild(empElem);

            appendTextElement(doc, empElem, "name", emp.name());
            appendTextElement(doc, empElem, "department", emp.department());
            appendTextElement(doc, empElem, "salary", String.valueOf(emp.salary()));
        }

        Transformer transformer = TransformerFactory.newInstance().newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
        var sw = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(sw));
        return sw.toString();
    }

    private static void appendTextElement(Document doc, Element parent, String tag, String text) {
        var elem = doc.createElement(tag);
        elem.setTextContent(text);
        parent.appendChild(elem);
    }

    // ---- SAX 方式: 読み込み ----

    private static class SaxEmployeeHandler extends DefaultHandler {
        final List<Employee> employees = new ArrayList<>();
        private String id;
        private String name;
        private String department;
        private String salary;
        private final StringBuilder currentText = new StringBuilder();

        @Override
        public void startElement(String uri, String localName, String qName, Attributes attributes) {
            if ("employee".equals(qName)) {
                id = attributes.getValue("id");
                name = department = salary = null;
            }
            currentText.setLength(0);
        }

        @Override
        public void characters(char[] ch, int start, int length) {
            currentText.append(ch, start, length);
        }

        @Override
        public void endElement(String uri, String localName, String qName) {
            var text = currentText.toString().trim();
            switch (qName) {
                case "name"       -> name       = text;
                case "department" -> department = text;
                case "salary"     -> salary     = text;
                case "employee"   -> employees.add(
                    new Employee(id, name, department, Integer.parseInt(salary)));
            }
        }
    }

    public static List<Employee> parseWithSax(String xml) throws Exception {
        var factory = SAXParserFactory.newInstance();
        var parser = factory.newSAXParser();
        var handler = new SaxEmployeeHandler();
        parser.parse(new InputSource(new StringReader(xml)), handler);
        return handler.employees;
    }

    // ---- StAX 方式: 読み込み ----

    public static List<Employee> parseWithStax(String xml) throws Exception {
        var factory = XMLInputFactory.newInstance();
        XMLStreamReader reader = factory.createXMLStreamReader(new StringReader(xml));

        var employees = new ArrayList<Employee>();
        String id = null, name = null, dept = null, salary = null;
        String currentTag = null;

        while (reader.hasNext()) {
            int event = reader.next();
            if (event == XMLStreamConstants.START_ELEMENT) {
                if ("employee".equals(reader.getLocalName())) {
                    id = reader.getAttributeValue(null, "id");
                    name = dept = salary = null;
                }
                currentTag = reader.getLocalName();

            } else if (event == XMLStreamConstants.CHARACTERS && id != null) {
                var text = reader.getText().trim();
                if (!text.isEmpty()) {
                    switch (currentTag) {
                        case "name"       -> name   = text;
                        case "department" -> dept   = text;
                        case "salary"     -> salary = text;
                    }
                }

            } else if (event == XMLStreamConstants.END_ELEMENT) {
                if ("employee".equals(reader.getLocalName()) && id != null) {
                    employees.add(new Employee(id, name, dept, Integer.parseInt(salary)));
                    id = null;
                }
                currentTag = null;
            }
        }
        reader.close();
        return employees;
    }

    public static void main(String[] args) throws Exception {
        // テキストブロック（Java 15+）でサンプル XML を読みやすく記述
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

        System.out.println("\n=== SAX パース ===");
        parseWithSax(xml).forEach(System.out::println);

        System.out.println("\n=== StAX パース ===");
        parseWithStax(xml).forEach(System.out::println);

        System.out.println("\n=== DOM で XML 生成 ===");
        System.out.println(buildWithDom(List.of(new Employee("3", "Tanaka Jiro", "HR", 350000))));
    }
}
