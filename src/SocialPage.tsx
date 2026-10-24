import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Facebook,
  ImagePlus,
  LoaderCircle,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { api } from "./api";
import type { User } from "./types";

type Preview = { file: File; url: string; kind: "image" | "video" };

export function SocialPage({ user }: { user: User }) {
  const input = useRef<HTMLInputElement>(null);
  const [connected, setConnected] = useState(false);
  const [pageName, setPageName] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<Preview[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    api
      .socialStatus(user.token)
      .then((s) => {
        setConnected(s.connected);
        setPageName(s.pageName || "");
      })
      .catch(() => setConnected(false))
      .finally(() => setLoading(false));
    return () => files.forEach((x) => URL.revokeObjectURL(x.url));
  }, []);
  const hasVideo = files.some((x) => x.kind === "video");
  const size = useMemo(
    () => files.reduce((n, x) => n + x.file.size, 0),
    [files],
  );
  function choose(chosen: FileList | null) {
    if (!chosen) return;
    setMessage("");
    const incoming = [...chosen];
    const videos = incoming.filter((x) => x.type.startsWith("video/"));
    if (videos.length && incoming.length > 1) {
      setMessage("Choose either one short video or up to 10 images.");
      return;
    }
    if (videos.length && videos[0].size > 100 * 1024 * 1024) {
      setMessage("Video must be smaller than 100 MB.");
      return;
    }
    if (!videos.length && incoming.some((x) => !x.type.startsWith("image/"))) {
      setMessage("Only image or video files are supported.");
      return;
    }
    setFiles(
      incoming
        .slice(0, 10)
        .map((file) => ({
          file,
          url: URL.createObjectURL(file),
          kind: file.type.startsWith("video/") ? "video" : "image",
        })),
    );
  }
  async function connect() {
    try {
      const { authorizationUrl } = await api.facebookConnectUrl(user.token);
      window.location.href = authorizationUrl;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to connect Facebook");
    }
  }
  async function publish() {
    if (!files.length) return;
    setPublishing(true);
    setMessage("");
    try {
      const result = await api.publishFacebook(
        caption,
        files.map((x) => x.file),
        user.token,
      );
      setMessage(`Published successfully · ${result.facebookPostId}`);
      files.forEach((x) => URL.revokeObjectURL(x.url));
      setFiles([]);
      setCaption("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Publishing failed");
    } finally {
      setPublishing(false);
    }
  }
  return (
    <div className="standard-page social-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">AI SOCIAL</span>
          <h1>Turn everyday work into stories</h1>
          <p>
            Upload shop photos or a short video and share them directly to your
            Facebook Page.
          </p>
        </div>
        <div className={connected ? "connection connected" : "connection"}>
          <Facebook size={19} />
          <span>
            {loading
              ? "Checking…"
              : connected
                ? `Connected · ${pageName}`
                : "Facebook not connected"}
          </span>
          {!loading && !connected && <button onClick={connect}>Connect</button>}
        </div>
      </div>
      <div className="social-layout">
        <section className="content-card composer">
          <div className="section-title">
            <div className="title-icon">
              <Sparkles />
            </div>
            <div>
              <h2>Create a Facebook post</h2>
              <p>AI caption and 30-second video generation are coming next.</p>
            </div>
          </div>
          <button
            className={`drop-zone ${files.length ? "has-files" : ""}`}
            onClick={() => input.current?.click()}
          >
            <input
              ref={input}
              hidden
              type="file"
              accept="image/*,video/mp4,video/quicktime"
              multiple={!hasVideo}
              onChange={(e) => choose(e.target.files)}
            />
            <UploadCloud />
            <strong>
              {files.length
                ? "Replace media"
                : "Choose images or a short video"}
            </strong>
            <span>Up to 10 images, or one MP4/MOV under 100 MB</span>
          </button>
          {files.length > 0 && (
            <div className="media-grid">
              {files.map((x) => (
                <div className="media-preview" key={x.url}>
                  {x.kind === "image" ? (
                    <img src={x.url} alt="Post preview" />
                  ) : (
                    <video src={x.url} controls />
                  )}
                  <span>{x.kind === "video" ? <Play /> : <ImagePlus />}</span>
                </div>
              ))}
            </div>
          )}
          <label className="caption-label">
            Caption
            <textarea
              maxLength={5000}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tell customers what is happening at your shop…"
            />
            <small>{caption.length} / 5,000</small>
          </label>
          {message && (
            <div
              className={
                message.startsWith("Published")
                  ? "social-message success"
                  : "social-message"
              }
            >
              {message.startsWith("Published") ? <Check /> : null}
              {message}
            </div>
          )}
          <div className="composer-actions">
            {files.length > 0 && (
              <button
                className="secondary danger"
                onClick={() => {
                  files.forEach((x) => URL.revokeObjectURL(x.url));
                  setFiles([]);
                }}
              >
                <Trash2 />
                Clear
              </button>
            )}
            <button
              className="primary"
              disabled={!connected || !files.length || publishing}
              onClick={publish}
            >
              {publishing ? <LoaderCircle className="spin" /> : <Send />}
              {publishing ? "Publishing…" : "Publish to Facebook"}
            </button>
          </div>
        </section>
        <aside className="social-guide">
          <div className="facebook-badge">
            <Facebook />
          </div>
          <h2>Shop-safe publishing</h2>
          <p>
            Each company connects its own Facebook Page. Posts and credentials
            are isolated from every other shop.
          </p>
          <ul>
            <li>
              <ShieldCheck />
              Your personal password and 2FA stay with Facebook.
            </li>
            <li>
              <ShieldCheck />
              Page tokens are encrypted before storage.
            </li>
            <li>
              <ShieldCheck />
              Every post is recorded for audit and status tracking.
            </li>
          </ul>
          <div className="coming">
            <span>COMING NEXT</span>
            <strong>AI 30-second shorts</strong>
            <p>
              Turn selected product and service photos into ready-to-post
              vertical videos.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
