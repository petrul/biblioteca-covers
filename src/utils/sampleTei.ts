import { AuthorPortraitConfig } from '../types';

export interface SampleBookItem {
  id: string;
  name: string;
  author: string;
  portrait: AuthorPortraitConfig;
  teiXml: string;
}

export const SAMPLE_BOOKS: SampleBookItem[] = [
  {
    id: 'frankenstein',
    name: 'Frankenstein (Mary Shelley)',
    author: 'Mary Shelley',
    portrait: {
      url: '/src/assets/images/author_mary_shelley_1790705950823.jpg',
      title: 'Mary Shelley — Author of Frankenstein (1818)',
      source: 'curated',
      treatment: 'etching',
      applyVintageFilter: false,
      cropShape: 'oval_cameo',
      zoom: 1.05,
      panX: 0,
      panY: -4,
      borderStyle: 'double_hairline',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">Frankenstein</title>
        <title type="sub">Or, The Modern Prometheus</title>
        <author>
          <persName>
            <forename>Mary</forename>
            <surname>Shelley</surname>
          </persName>
        </author>
        <editor>Percy Bysshe Shelley</editor>
        <respStmt>
          <resp>Encoded according to TEI Guidelines</resp>
          <name>Scriptorium Bibliographic Archive</name>
        </respStmt>
      </titleStmt>
      <publicationStmt>
        <publisher>Ediții Scriptorium</publisher>
        <pubPlace>București</pubPlace>
        <date when="${new Date().getFullYear()}">${new Date().getFullYear()}</date>
        <idno type="ISBN">978-0-14-143947-1</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">Scriptorium Classique</title>
        <biblScope unit="volume">Vol. I</biblScope>
      </seriesStmt>
      <sourceDesc>
        <bibl>First Edition, Three Volumes in Octavo, London.</bibl>
      </sourceDesc>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>Gothic Fiction</term>
          <term>Romantic Literature</term>
          <term>Science Fiction</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“Did I request thee, Maker, from my clay to mould me man? Did I solicit thee from darkness to promote me?”</quote>
        <bibl>John Milton, Paradise Lost</bibl>
      </epigraph>
    </front>
    <body>
      <div><p>Letter I. To Mrs. Saville, England.</p></div>
    </body>
  </text>
</TEI>`,
  },
  {
    id: 'dorian_gray',
    name: 'The Picture of Dorian Gray (Oscar Wilde)',
    author: 'Oscar Wilde',
    portrait: {
      url: '/src/assets/images/author_oscar_wilde_1790705962351.jpg',
      title: 'Oscar Wilde — Late Victorian Studio Portrait',
      source: 'curated',
      treatment: 'sepia',
      applyVintageFilter: false,
      cropShape: 'circle_medallion',
      zoom: 1.05,
      panX: 0,
      panY: -5,
      borderStyle: 'thin_gold',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">The Picture of Dorian Gray</title>
        <title type="sub">A Moral and Aesthetic Romance</title>
        <author>Oscar Wilde</author>
      </titleStmt>
      <editionStmt>
        <edition>Definitive Uncensored Ward, Lock and Co. Edition</edition>
      </editionStmt>
      <publicationStmt>
        <publisher>Ward, Lock &amp; Co., Limited</publisher>
        <pubPlace>London, New York &amp; Melbourne</pubPlace>
        <date when="1891">1891</date>
        <idno type="ISBN">978-0-19-953598-9</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">The Aesthetic Movement Monograph Series</title>
        <biblScope unit="volume">Volume IV</biblScope>
      </seriesStmt>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>Decadent Fiction</term>
          <term>Philosophical Novel</term>
          <term>Aestheticism</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“There is no such thing as a moral or an immoral book. Books are well written, or badly written. That is all.”</quote>
      </epigraph>
    </front>
    <body>
      <div><p>The studio was filled with the rich odour of roses...</p></div>
    </body>
  </text>
</TEI>`,
  },
  {
    id: 'metamorphosis',
    name: 'The Metamorphosis (Franz Kafka)',
    author: 'Franz Kafka',
    portrait: {
      url: '/src/assets/images/author_franz_kafka_1790705974173.jpg',
      title: 'Franz Kafka — Author of Die Verwandlung (Prague)',
      source: 'curated',
      treatment: 'high_contrast',
      applyVintageFilter: false,
      cropShape: 'square_frame',
      zoom: 1.05,
      panX: 0,
      panY: -4,
      borderStyle: 'double_hairline',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">The Metamorphosis</title>
        <title type="sub">Die Verwandlung</title>
        <author>Franz Kafka</author>
        <respStmt>
          <resp>Translated by</resp>
          <name>Willa &amp; Edwin Muir</name>
        </respStmt>
      </titleStmt>
      <publicationStmt>
        <publisher>Kurt Wolff Verlag</publisher>
        <pubPlace>Leipzig</pubPlace>
        <date when="1915">1915</date>
        <idno type="ISBN">978-0-553-21369-0</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">Der Jüngste Tag: Neue Dichtungen</title>
        <biblScope unit="volume">Heft 22/23</biblScope>
      </seriesStmt>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>Absurdist Fiction</term>
          <term>Existential Allegory</term>
          <term>Modernist Novella</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed into a monstrous insect.”</quote>
      </epigraph>
    </front>
    <body>
      <div><p>He lay on his hard, as it were armor-plated back...</p></div>
    </body>
  </text>
</TEI>`,
  },
  {
    id: 'pride_and_prejudice',
    name: 'Pride and Prejudice (Jane Austen)',
    author: 'Jane Austen',
    portrait: {
      url: '/src/assets/images/author_jane_austen_1790705983604.jpg',
      title: 'Jane Austen — Regency Portrait',
      source: 'curated',
      treatment: 'monochrome',
      applyVintageFilter: false,
      cropShape: 'oval_cameo',
      zoom: 1.05,
      panX: 0,
      panY: 0,
      borderStyle: 'ornate_woodcut',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">Pride and Prejudice</title>
        <title type="sub">A Novel in Three Volumes</title>
        <author>Jane Austen</author>
      </titleStmt>
      <publicationStmt>
        <publisher>Thomas Egerton, Military Library</publisher>
        <pubPlace>Whitehall, London</pubPlace>
        <date when="1813">1813</date>
        <idno type="ISBN">978-0-14-143951-8</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">Regency Literary Masters</title>
        <biblScope unit="volume">Volume II</biblScope>
      </seriesStmt>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>Regency Romance</term>
          <term>Satire of Manners</term>
          <term>Classic English Novel</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.”</quote>
      </epigraph>
    </front>
    <body>
      <div><p>However little known the feelings or views of such a man may be...</p></div>
    </body>
  </text>
</TEI>`,
  },
  {
    id: 'meditations',
    name: 'Meditations (Marcus Aurelius)',
    author: 'Marcus Aurelius',
    portrait: {
      url: '/src/assets/images/author_marcus_aurelius_1790705993477.jpg',
      title: 'Marcus Aurelius — Classical Roman Marble Bust',
      source: 'curated',
      treatment: 'etching',
      applyVintageFilter: false,
      cropShape: 'arch',
      zoom: 1.05,
      panX: 0,
      panY: -3,
      borderStyle: 'double_hairline',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">Meditations</title>
        <title type="sub">Thoughts Addressed to Himself</title>
        <author>Marcus Aurelius Antoninus</author>
        <respStmt>
          <resp>Translated with an Introduction by</resp>
          <name>George Long, M.A.</name>
        </respStmt>
      </titleStmt>
      <publicationStmt>
        <publisher>Oxford University Press</publisher>
        <pubPlace>Clarendon Building, Oxford</pubPlace>
        <date when="1906">1906</date>
        <idno type="ISBN">978-0-19-954059-4</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">Scriptorum Classicorum Bibliotheca Oxoniensis</title>
        <biblScope unit="volume">Tomus XII</biblScope>
      </seriesStmt>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>Stoic Philosophy</term>
          <term>Classical Ethics</term>
          <term>Roman Imperial Writings</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“You have power over your mind - not outside events. Realise this, and you will find strength.”</quote>
      </epigraph>
    </front>
    <body>
      <div><p>Book I. From my grandfather Verus I learned good morals...</p></div>
    </body>
  </text>
</TEI>`,
  },
  {
    id: 'alice_in_wonderland',
    name: 'Alice in Wonderland (Lewis Carroll)',
    author: 'Lewis Carroll',
    portrait: {
      url: '/src/assets/images/author_lewis_carroll_cartoon_1790706772748.jpg',
      title: 'Lewis Carroll — Whimsical Storybook Cartoon',
      source: 'curated',
      treatment: 'cartoon_pop',
      applyVintageFilter: false,
      cropShape: 'cloud_bubble',
      zoom: 1.05,
      panX: 0,
      panY: 0,
      borderStyle: 'thin_gold',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">Alice's Adventures in Wonderland</title>
        <title type="sub">Down the Rabbit Hole</title>
        <author>Lewis Carroll</author>
      </titleStmt>
      <publicationStmt>
        <publisher>Macmillan and Co.</publisher>
        <pubPlace>London</pubPlace>
        <date when="1865">1865</date>
        <idno type="ISBN">978-0-14-143976-1</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">Illustrated Wonder Tales</title>
        <biblScope unit="volume">Book I</biblScope>
      </seriesStmt>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>Fantasy Adventure</term>
          <term>Nonsense Literature</term>
          <term>Illustrated Classic</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“Curiouser and curiouser!” cried Alice. “Why, sometimes I've believed as many as six impossible things before breakfast.”</quote>
      </epigraph>
    </front>
    <body>
      <div><p>Alice was beginning to get very tired of sitting by her sister on the bank...</p></div>
    </body>
  </text>
</TEI>`,
  },
  {
    id: 'wizard_of_oz',
    name: 'The Wizard of Oz (L. Frank Baum)',
    author: 'L. Frank Baum',
    portrait: {
      url: '/src/assets/images/author_frank_baum_cartoon_1790706783459.jpg',
      title: 'L. Frank Baum — Joyful Emerald Glasses Cartoon',
      source: 'curated',
      treatment: 'cartoon_pop',
      applyVintageFilter: false,
      cropShape: 'circle_medallion',
      zoom: 1.05,
      panX: 0,
      panY: 0,
      borderStyle: 'double_hairline',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">The Wonderful Wizard of Oz</title>
        <title type="sub">Follow the Yellow Brick Road</title>
        <author>L. Frank Baum</author>
      </titleStmt>
      <publicationStmt>
        <publisher>George M. Hill Company</publisher>
        <pubPlace>Chicago &amp; New York</pubPlace>
        <date when="1900">1900</date>
        <idno type="ISBN">978-0-14-062164-8</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">The Emerald City Classics</title>
        <biblScope unit="volume">Volume I</biblScope>
      </seriesStmt>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>Children's Fantasy</term>
          <term>American Fairy Tale</term>
          <term>Magical Quest</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“There is no place like home! A heart is not judged by how much you love, but by how much you are loved by others.”</quote>
      </epigraph>
    </front>
    <body>
      <div><p>Dorothy lived in the midst of the great Kansas prairies...</p></div>
    </body>
  </text>
</TEI>`,
  },
  {
    id: 'twenty_thousand_leagues',
    name: '20,000 Leagues Under the Sea (Jules Verne)',
    author: 'Jules Verne',
    portrait: {
      url: '/src/assets/images/author_jules_verne_clean_1790940362977.jpg',
      title: 'Jules Verne — High Adventure Victorian Engraving',
      source: 'curated',
      treatment: 'sepia',
      applyVintageFilter: false,
      cropShape: 'full_bleed',
      zoom: 1.05,
      panX: 0,
      panY: -2,
      borderStyle: 'none',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">Twenty Thousand Leagues Under the Sea</title>
        <title type="sub">A World Tour Underwater</title>
        <author>Jules Verne</author>
        <respStmt>
          <resp>Translated by</resp>
          <name>F. P. Walter</name>
        </respStmt>
      </titleStmt>
      <publicationStmt>
        <publisher>Pierre-Jules Hetzel</publisher>
        <pubPlace>Paris &amp; London</pubPlace>
        <date when="1870">1870</date>
        <idno type="ISBN">978-0-14-044853-5</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">Voyages Extraordinaires</title>
        <biblScope unit="volume">Tome VI</biblScope>
      </seriesStmt>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>High Adventure</term>
          <term>Nautical Expedition</term>
          <term>Scientific Romance</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“The sea is everything. It covers seven tenths of the terrestrial globe. Its breath is pure and healthy.”</quote>
      </epigraph>
    </front>
    <body>
      <div><p>The year 1866 was signalised by a remarkable incident...</p></div>
    </body>
  </text>
</TEI>`,
  },
  {
    id: 'war_and_peace',
    name: 'War and Peace (Leo Tolstoy)',
    author: 'Leo Tolstoy',
    portrait: {
      url: '/src/assets/images/author_leo_tolstoy_1790939805691.jpg',
      title: 'Leo Tolstoy — Russian Historical Woodcut',
      source: 'curated',
      treatment: 'high_contrast',
      applyVintageFilter: false,
      cropShape: 'full_bleed',
      zoom: 1.05,
      panX: 0,
      panY: -2,
      borderStyle: 'none',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">War and Peace</title>
        <title type="sub">Война и миръ</title>
        <author>Leo Tolstoy</author>
        <respStmt>
          <resp>Translated by</resp>
          <name>Louise and Aylmer Maude</name>
        </respStmt>
      </titleStmt>
      <publicationStmt>
        <publisher>The Russian Messenger</publisher>
        <pubPlace>Moscow &amp; St. Petersburg</pubPlace>
        <date when="1869">1869</date>
        <idno type="ISBN">978-0-19-923276-5</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">Biblioteka Russkoy Klassiki</title>
        <biblScope unit="volume">Tom Pervyy</biblScope>
      </seriesStmt>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>Slavic Masterpiece</term>
          <term>Historical Epic</term>
          <term>Russian Literature</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“We can know only that we know nothing. And that is the highest degree of human wisdom.”</quote>
      </epigraph>
    </front>
    <body>
      <div><p>“Well, Prince, so Genoa and Lucca are now just family estates of the Buonapartes...”</p></div>
    </body>
  </text>
</TEI>`,
  },
  {
    id: 'art_of_war',
    name: 'The Art of War (Sun Tzu)',
    author: 'Sun Tzu',
    portrait: {
      url: '/src/assets/images/author_sun_tzu_1790939821610.jpg',
      title: 'Sun Tzu — East Asian Classical Brush & Ink',
      source: 'curated',
      treatment: 'monochrome',
      applyVintageFilter: false,
      cropShape: 'full_bleed',
      zoom: 1.05,
      panX: 0,
      panY: -2,
      borderStyle: 'none',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">The Art of War</title>
        <title type="sub">孫子兵法 · Thirteen Treatises on Strategy</title>
        <author>Sun Tzu</author>
        <respStmt>
          <resp>Translated with Critical Notes by</resp>
          <name>Lionel Giles, M.A.</name>
        </respStmt>
      </titleStmt>
      <publicationStmt>
        <publisher>Luzac &amp; Co., Oriental Publishers</publisher>
        <pubPlace>London &amp; Shanghai</pubPlace>
        <date when="1910">1910</date>
        <idno type="ISBN">978-0-19-501476-1</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">Oriental Translation Fund Series</title>
        <biblScope unit="volume">Volume XVIII</biblScope>
      </seriesStmt>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>East Asian Philosophy</term>
          <term>Classical Strategy</term>
          <term>Ancient Chinese Treatise</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“The supreme art of war is to subdue the enemy without fighting. In the midst of chaos, there is also opportunity.”</quote>
      </epigraph>
    </front>
    <body>
      <div><p>Sun Tzu said: The art of war is of vital importance to the State...</p></div>
    </body>
  </text>
</TEI>`,
  },
  {
    id: 'decline_and_fall',
    name: 'The Decline and Fall (Edward Gibbon)',
    author: 'Edward Gibbon',
    portrait: {
      url: '/src/assets/images/author_edward_gibbon_1790939834709.jpg',
      title: 'Edward Gibbon — Historical Documentary Etching',
      source: 'curated',
      treatment: 'sepia',
      applyVintageFilter: false,
      cropShape: 'full_bleed',
      zoom: 1.05,
      panX: 0,
      panY: -2,
      borderStyle: 'none',
    },
    teiXml: `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title type="main">The Decline and Fall of the Roman Empire</title>
        <title type="sub">A Comprehensive History of the Mediterranean World</title>
        <author>Edward Gibbon</author>
      </titleStmt>
      <publicationStmt>
        <publisher>W. Strahan and T. Cadell</publisher>
        <pubPlace>In the Strand, London</pubPlace>
        <date when="1776">1776</date>
        <idno type="ISBN">978-0-14-043764-5</idno>
      </publicationStmt>
      <seriesStmt>
        <title level="s">Archival Historical Chronicles</title>
        <biblScope unit="volume">Volume I</biblScope>
      </seriesStmt>
    </fileDesc>
    <profileDesc>
      <textClass>
        <keywords scheme="genre">
          <term>Historical Documentary</term>
          <term>Classical History</term>
          <term>Monumental Chronicle</term>
        </keywords>
      </textClass>
    </profileDesc>
  </teiHeader>
  <text>
    <front>
      <epigraph>
        <quote>“History is, indeed, little more than the register of the crimes, follies, and misfortunes of mankind.”</quote>
      </epigraph>
    </front>
    <body>
      <div><p>In the second century of the Christian era, the Empire of Rome comprehended the fairest part of the earth...</p></div>
    </body>
  </text>
</TEI>`,
  },
];
