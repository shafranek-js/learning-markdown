// Curated syntax regression examples derived from CommonMark 0.31.2 and GFM.
// They are NOT a complete normative conformance certification.
import assert from 'node:assert/strict';
import {marked} from 'marked';
const parse=(markdown,dialect)=>marked.parse(markdown,{gfm:dialect==='gfm',pedantic:false,breaks:false});
const cases=[
  [
    "ATX H1",
    "commonmark",
    "# Heading\n",
    [
      "<h1>Heading</h1>"
    ],
    []
  ],
  [
    "ATX H6",
    "commonmark",
    "###### Heading\n",
    [
      "<h6>Heading</h6>"
    ],
    []
  ],
  [
    "ATX requires a space",
    "commonmark",
    "#Heading\n",
    [
      "#Heading"
    ],
    [
      "<h1"
    ]
  ],
  [
    "Too many hashes are text",
    "commonmark",
    "####### Not a heading\n",
    [
      "Not a heading"
    ],
    [
      "<h6"
    ]
  ],
  [
    "Escaped heading marker",
    "commonmark",
    "\\# Literal heading\n",
    [
      "# Literal heading"
    ],
    [
      "<h1"
    ]
  ],
  [
    "Setext H1",
    "commonmark",
    "Title\n=====\n",
    [
      "<h1>Title</h1>"
    ],
    []
  ],
  [
    "Setext H2",
    "commonmark",
    "Title\n-----\n",
    [
      "<h2>Title</h2>"
    ],
    []
  ],
  [
    "Thematic break without title",
    "commonmark",
    "---\n",
    [
      "<hr"
    ],
    [
      "<h2"
    ]
  ],
  [
    "Soft break stays soft",
    "commonmark",
    "First\nSecond\n",
    [
      "First\nSecond"
    ],
    [
      "<br"
    ]
  ],
  [
    "Two-space hard break",
    "commonmark",
    "First  \nSecond\n",
    [
      "<br"
    ],
    []
  ],
  [
    "Backslash hard break",
    "commonmark",
    "First\\\nSecond\n",
    [
      "<br"
    ],
    []
  ],
  [
    "Paragraph separator",
    "commonmark",
    "First\n\nSecond\n",
    [
      "<p>First</p>",
      "<p>Second</p>"
    ],
    []
  ],
  [
    "Strong and emphasis",
    "commonmark",
    "***Both***\n",
    [
      "<em>",
      "<strong>"
    ],
    []
  ],
  [
    "Inline code",
    "commonmark",
    "Use `npm run build`.\n",
    [
      "<code>npm run build</code>"
    ],
    []
  ],
  [
    "Indented code",
    "commonmark",
    "    const value = 1;\n",
    [
      "<pre>",
      "<code>"
    ],
    []
  ],
  [
    "Fenced code",
    "commonmark",
    "~~~js\nconst ok = true;\n~~~\n",
    [
      "<pre>",
      "language-js"
    ],
    []
  ],
  [
    "Nested blockquote",
    "commonmark",
    "> outer\n>\n>> inner\n",
    [
      "<blockquote>"
    ],
    []
  ],
  [
    "Numbered list",
    "commonmark",
    "1. First\n2. Second\n",
    [
      "<ol>",
      "<li>First"
    ],
    []
  ],
  [
    "Reference link",
    "commonmark",
    "A [reference][doc].\n\n[doc]: https://commonmark.org/\n",
    [
      "<a href="
    ],
    []
  ],
  [
    "Inline link",
    "commonmark",
    "[Website](https://example.com/)\n",
    [
      "<a href="
    ],
    []
  ],
  [
    "Image alt text",
    "commonmark",
    "![Diagram](https://example.com/test.png)\n",
    [
      "<img",
      "alt=\"Diagram\""
    ],
    []
  ],
  [
    "Email autolink",
    "commonmark",
    "<hello@example.com>\n",
    [
      "mailto:hello@example.com"
    ],
    []
  ],
  [
    "Escaped emphasis",
    "commonmark",
    "\\*not italic\\*\n",
    [
      "*not italic*"
    ],
    [
      "<em>"
    ]
  ],
  [
    "GFM table",
    "gfm",
    "| A | B |\n| --- | --- |\n| one | two |\n",
    [
      "<table>",
      "<td>"
    ],
    []
  ],
  [
    "No CommonMark table",
    "commonmark",
    "| A | B |\n| --- | --- |\n| one | two |\n",
    [],
    [
      "<table>"
    ]
  ],
  [
    "GFM strike",
    "gfm",
    "~~done~~\n",
    [
      "<del>done</del>"
    ],
    []
  ],
  [
    "No CommonMark strike",
    "commonmark",
    "~~done~~\n",
    [],
    [
      "<del>"
    ]
  ],
  [
    "GFM checklist",
    "gfm",
    "- [x] done\n- [ ] todo\n",
    [
      "type=\"checkbox\""
    ],
    []
  ],
  [
    "No CommonMark checklist",
    "commonmark",
    "- [x] done\n- [ ] todo\n",
    [],
    [
      "type=\"checkbox\""
    ]
  ],
  [
    "No implicit hard break in GFM files",
    "gfm",
    "Line one\nLine two\n",
    [],
    [
      "<br"
    ]
  ]
];
for(const [name,dialect,markdown,required,forbidden] of cases){
 const html=parse(markdown,dialect);
 for(const text of required)assert(html.includes(text),name+': missing '+JSON.stringify(text)+' in '+JSON.stringify(html));
 for(const text of forbidden)assert(!html.includes(text),name+': unexpected '+JSON.stringify(text)+' in '+JSON.stringify(html));
}
console.log('PASS: '+cases.length+' curated CommonMark/GFM syntax regression cases');
