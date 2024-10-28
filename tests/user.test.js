const mongoose = require("mongoose");
const userModel = require("../models/user");
const app = require("../app"); // Import your Express app
const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const { expect } = chai;

describe("User Authentication", function () {
  // Clean up database before each test to isolate cases
  before(async function () {
    await mongoose.connect("mongodb://127.0.0.1:27017/authtestapp", { useNewUrlParser: true, useUnifiedTopology: true });
  });

  after(async function () {
    await mongoose.connection.close();
  });

  afterEach(async function () {
    await userModel.deleteMany({});
  });

  describe("POST /create - User Registration", function () {
    it("should register a new user", async function () {
      const res = await chai.request(app)
        .post("/create")
        .send({
          username: "testuser",
          email: "testuser@example.com",
          password: "password123",
          age: 25
        });
      expect(res).to.have.status(200);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("username", "testuser");
    });

    it("should not register a user with an existing email", async function () {
      await userModel.create({
        username: "existingUser",
        email: "testuser@example.com",
        password: "password123",
        age: 25
      });

      const res = await chai.request(app)
        .post("/create")
        .send({
          username: "testuser",
          email: "testuser@example.com",
          password: "password123",
          age: 25
        });

      expect(res).to.have.status(500);
      expect(res.text).to.include("Error creating user");
    });

    it("should not register a user with invalid age", async function () {
      const res = await chai.request(app)
        .post("/create")
        .send({
          username: "testuser",
          email: "testuser@example.com",
          password: "password123",
          age: -1
        });
      expect(res).to.have.status(500);
    });
  });

  describe("POST /login - User Login", function () {
    beforeEach(async function () {
      const bcrypt = require("bcrypt");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("password123", salt);
      await userModel.create({
        username: "testuser",
        email: "testuser@example.com",
        password: hash,
        age: 25
      });
    });

    it("should log in a registered user with correct password", async function () {
      const res = await chai.request(app)
        .post("/login")
        .send({ email: "testuser@example.com", password: "password123" });

      expect(res).to.have.status(200);
      expect(res.text).to.equal("yes you can login");
    });

    it("should not log in a user with incorrect password", async function () {
      const res = await chai.request(app)
        .post("/login")
        .send({ email: "testuser@example.com", password: "wrongpassword" });

      expect(res).to.have.status(401);
      expect(res.text).to.equal("Invalid password");
    });

    it("should not log in a non-existent user", async function () {
      const res = await chai.request(app)
        .post("/login")
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(res).to.have.status(404);
      expect(res.text).to.equal("User not found");
    });
  });

  describe("GET /logout - User Logout", function () {
    it("should log out a user", async function () {
      const res = await chai.request(app)
        .get("/logout");

      expect(res).to.have.status(200);
      expect(res.redirects[0]).to.include("/");
    });
  });
});
