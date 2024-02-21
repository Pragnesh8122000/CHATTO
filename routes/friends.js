class FriendsRouter {
  constructor() {
    this.router = require("express").Router();
    this.friendsController = require("../controller/friends.controller");
    this.setRoutes();
  }

  setRoutes() {
    this.router.get("/friend/list", this.friendsController.getFriendRequestList);
    this.router.get("/friend/count", this.friendsController.getFriendRequestCount);
    this.router.post("/friend/req", this.friendsController.sendFriendRequest);
    this.router.put("/friend/req/response/:reqId", this.friendsController.responseFriendRequest);
  }
}

const router = new FriendsRouter();
module.exports = router.router;