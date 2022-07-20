import React from "react";
import { GithubPicker, ColorResult } from "react-color";
import "./App.css";

const alpha = 0.8;

const defaultColors = [
  "#B80000",
  "#DB3E00",
  "#FCCB00",
  "#008B02",
  "#006B76",
  "#1273DE",
  "#004DCF",
  "#5300EB",
  "#EB9694",
  "#FAD0C3",
  "#FEF3BD",
  "#C1E1C5",
  "#BEDADC",
  "#C4DEF6",
  "#BED3F3",
  "#D4C4FB",
];

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

const rgba = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex);
  if (rgb) {
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
  }
  return hex;
};

const defaultPickerColors = defaultColors.map((color) => rgba(color, alpha));
const defaultColor = defaultColors[13];

type Bookmark = {
  name: string;
  url: string;
  backgroundColor?: string;
};

const loadBookmarks = () => {
  const bookmarks = localStorage.getItem("bookmarks");
  if (typeof bookmarks !== "string") return null;
  return (JSON.parse(bookmarks) as Bookmark[]).filter((v) => v.url);
};

function App() {
  const [name, setName] = React.useState("");
  const [openPicker, setOpenPicker] = React.useState(false);
  const [color, setColor] = React.useState<string>(defaultColor);
  const [url, setUrl] = React.useState("");
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>(loadBookmarks() || []);
  const [selectedMarks, setSelectedMarks] = React.useState<string[]>([]);

  React.useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const reversedBookmarks = React.useMemo(() => [...bookmarks].reverse(), [bookmarks]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        setBookmarks((bookmarks) => bookmarks.filter((v) => selectedMarks.indexOf(v.url) < 0));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const onClick = (e: MouseEvent) => {
      if (selectedMarks.length > 0) {
        setSelectedMarks([]);
      }
      setOpenPicker(false);
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
    };
  }, [selectedMarks]);

  const clickAddBookmark = (name: string, url: string, color?: string) => {
    if (url === "") return;
    const title = name ? name : url;
    setBookmarks((bookmarks) => [
      ...bookmarks.filter((v) => v.url !== url),
      { name: title, url, backgroundColor: color },
    ]);
    setSelectedMarks([]);
  };

  const toggleColorPicker = () => {
    setOpenPicker((flag) => !flag);
  };

  const changeColor = (color: ColorResult) => {
    setColor(color.hex);
    setOpenPicker((flag) => !flag);
    if (selectedMarks.length > 0) {
      setBookmarks((bookmarks) => {
        return bookmarks.map((v) => {
          if (selectedMarks.indexOf(v.url) >= 0) {
            return { ...v, backgroundColor: color.hex };
          }
          return v;
        });
      });
    }
  };

  return (
    <>
      <div className="mark-top-header">
        <div className="mark-container" onClick={(e) => e.stopPropagation()}>
          <div
            className="mark-color"
            style={{ backgroundColor: rgba(color, alpha) }}
            onClick={(e) => {
              e.stopPropagation();
              toggleColorPicker();
            }}></div>
          <div className="mark-cell-small">
            <button
              className="mark-button"
              onClick={() => {
                setName("");
              }}>
              Clear
            </button>
          </div>
          <div className="mark-cell">
            <input
              placeholder="name"
              className="mark-input"
              type="text"
              value={name}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
          <div className="mark-cell-small">
            <button
              className="mark-button"
              onClick={() => {
                clickAddBookmark(name, url, color);
              }}>
              Add
            </button>
          </div>
          <div className="mark-cell-2">
            <input
              placeholder="url"
              className="mark-input"
              type="text"
              value={url}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => {
                e.stopPropagation();
                setUrl(e.target.value);
              }}
            />
          </div>
        </div>
        {openPicker ? (
          <div className="mark-color-picker" onClick={(e) => e.stopPropagation()}>
            <GithubPicker color={color} onChange={changeColor} colors={defaultPickerColors} />
          </div>
        ) : null}
      </div>
      <div className="mark-body-container">
        {reversedBookmarks.map((v) => {
          const selected = selectedMarks.indexOf(v.url) >= 0;
          const color = v.backgroundColor || defaultColor;
          const fontColor =
            defaultColors.indexOf(color.toUpperCase()) > defaultColors.length / 2 ||
            color === defaultColor
              ? "#444"
              : "white";
          return (
            <div
              key={v.url}
              className="mark-card"
              style={{
                backgroundColor: rgba(color, alpha),
                border: selected ? `solid 2px blue` : `solid 2px white`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (e.shiftKey) {
                  setSelectedMarks((s) => {
                    return [...new Set([...s, v.url])];
                  });
                } else {
                  setSelectedMarks([v.url]);
                }
                setName(v.name);
                setUrl(v.url);
                setColor(v.backgroundColor || defaultColor);
              }}>
              <a
                href={v.url}
                rel="noopener noreferrer"
                style={{
                  color: fontColor,
                }}
                target="_blank"
                onClick={() => {
                  clickAddBookmark(v.name, v.url, v.backgroundColor);
                }}>
                {v.name}
              </a>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
