const { Router } = require("express");
const authMiddleware = require("../auth/middleware");
const PlayList = require("../models").playlist;
const Song = require("../models").song;
const User = require("../models").user;

const router = new Router();

router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const playlists = await PlayList.findByPk(id, {
      include: [Song],
    });
    res.status(200).send({ message: "ok", playlists });
  } catch (error) {
    next(error);
  }
});

router.post("/create", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .send({ message: "Please provide a name for the playlist" });
    }

    const playlist = await PlayList.create({
      name,
      userId: user.id,
    });

    return res.status(201).send({ message: "Playlist created", playlist });
  } catch (error) {
    next(error);
  }
});

router.get("/mylists/:userId/", authMiddleware, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await User.findByPk(userId, {
      include: { model: PlayList, include: { model: Song } },
    });

    if (user) {
      delete user.dataValues["password"];
      res.send(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/:id/song", authMiddleware, async (req, res, next) => {
  try {
    const playlist = await PlayList.findByPk(req.params.id, {
      include: [Song],
    });

    if (playlist === null) {
      return res.status(400).send({ message: "Playlist does not exist" });
    }

    const { title, artist, image, uri, origin } = req.body;

    const song = await Song.create({
      title,
      artist,
      image,
      uri,
      origin,
      playlistId: playlist.id,
    });

    return res.status(201).send({ message: "Song added", song });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id/delete", authMiddleware, async (req, res, next) => {
  try {
    const playlistId = parseInt(req.params.id);
    const playlist = await PlayList.findByPk(playlistId, { include: [Song] });

    if (playlist.songs.length === 0) {
      await playlist.destroy();
    }
    playlist.songs.forEach(
      async (songs) => (await songs.destroy()) && (await playlist.destroy()),
    );

    return res.status(200).send({
      message: "PlayList successfully deleted",
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/song/:id/delete", authMiddleware, async (req, res, next) => {
  try {
    const songID = parseInt(req.params.id);
    const song = await Song.findByPk(songID);

    const deleteSong = await song.destroy();

    return res
      .status(200)
      .send({ message: "Song successfully deleted", deleteSong });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
