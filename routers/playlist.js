const { Router } = require("express");
const authMiddleware = require("../auth/middleware");
const PlayList = require("../models").playlist;
const Song = require("../models").song;

const router = new Router();

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const playlists = await PlayList.findAll({
      include: [Song],
    });
    res.status(200).send({ message: "ok", playlists });
  } catch (error) {
    next(error);
  }
});

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .send({ message: "Please provide a name for the playlist" });
    }
    const playlist = await PlayList.create({ name, userId: req.user.id });
    return res.status(201).send({ message: "Playlist created", playlist });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(id);
    if (isNaN(parseInt(id))) {
      return res
        .status(400)
        .send({ message: "Playlist id should be a number" });
    }

    const playlist = await PlayList.findByPk(id, {
      include: [Song],
    });

    if (playlist === null) {
      return res.status(404).send({ message: "Playlist not found" });
    }

    res.status(200).send({ message: "ok", playlist });
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

module.exports = router;