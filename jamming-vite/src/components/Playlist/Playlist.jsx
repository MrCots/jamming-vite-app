import React, { useCallback, useState } from "react";

import "./Playlist.css";

import TrackList from "../TrackList/TrackList.jsx";

const Playlist = ({ playlistTracks, onRemove, onSave, onNameChange }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleNameChange = useCallback(
    (event) => {
      onNameChange(event.target.value);
    },
    [onNameChange]
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Ensure onSave can be awaited even if it isn't a Promise
      await Promise.resolve(onSave());
    } catch (err) {
      console.error("Playlist save failed", err);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  return (
    <div className="Playlist">
      <input onChange={handleNameChange} defaultValue={"New Playlist"} />
      <TrackList
        tracks={playlistTracks}
        isRemoval={true}
        onRemove={onRemove}
      />
      <button
        type="button"
        className="Playlist-save"
        onClick={handleSave}
        disabled={isSaving}
        aria-busy={isSaving}
      >
        {isSaving ? "Saving..." : "SAVE TO SPOTIFY"}
      </button>

      {isSaving && (
        <div className="SavingOverlay" aria-hidden="true">
          <div className="Spinner" />
        </div>
      )}
    </div>
  );
};

export default Playlist;
