import React from "react";
import "./App.css";

type Bookmark = {
  name: string;
  url: string;
};

const loadBookmarks = () => {
  const bookmarks = localStorage.getItem("bookmarks");
  if (typeof bookmarks !== "string") return null;
  return (JSON.parse(bookmarks) as Bookmark[]).filter((v) => v.url);
};

function App() {
  const [name, setName] = React.useState("");
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
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
    };
  }, [selectedMarks]);

  const clickAddBookmark = (name: string, url: string) => {
    if (url === "") return;
    const title = name ? name : url;
    setBookmarks((bookmarks) => [...bookmarks.filter((v) => v.url !== url), { name: title, url }]);
    setSelectedMarks([]);
  };

  return (
    <>
      <div className="mark-top-header">
        <div className="mark-container" onClick={(e) => e.stopPropagation()}>
          <div className="mark-cell-small">
            <button
              className="mark-button"
              onClick={() => {
                setName("");
              }}
            >
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
                clickAddBookmark(name, url);
              }}
            >
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
      </div>
      <div className="mark-body-container">
        {reversedBookmarks.map((v) => {
          return (
            <div
              key={v.url}
              className={
                selectedMarks.indexOf(v.url) >= 0 ? "mark-card mark-selected" : "mark-card"
              }
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
              }}
            >
              <a
                href={v.url}
                rel="noopener noreferrer"
                target="_blank"
                onClick={() => {
                  clickAddBookmark(v.name, v.url);
                }}
              >
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
