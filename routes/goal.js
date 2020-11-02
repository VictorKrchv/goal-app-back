const { Router } = require("express");
const checkToken = require("../middlewares/checkToken");
const { Goal, PlanList } = require("../models/goal");
const User = require("../models/user");
const router = Router();

router.get("/", async (req, res) => {
  try {
    const planList = await Goal.findAll({
      include: [
        { model: User, as: "author", attributes: ["email", "id"] },
        PlanList,
      ],
      attributes: {
        exclude: ["authorId"],
      },
    });
    res.status(200).json({ data: planList });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, as: "author", attributes: ["email", "id"] },
        PlanList,
      ],
      attributes: {
        exclude: ["authorId"],
      },
    });

    res.status(200).json({ data: goal });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/", checkToken, async (req, res) => {
  const { title, description, goalCompletion, plans } = req.body;
  try {
    const goal = await Goal.create({
      title,
      description,
      goalCompletion,
      authorId: req.user.id,
    });
    const [_, user] = await Promise.all([
      PlanList.bulkCreate(
        plans.map((plan) => ({
          name: plan,
          goalId: goal.dataValues.id,
        }))
      ),
      User.findOne({ where: { id: req.user.id } }),
    ]);

    res.status(201).json({
      message: "Цель создана",
      data: {
        plans: plans.map((plan) => ({
          name: plan.name,
          isComplete: false,
        })),
        author: { id: user.id, email: user.email },
        title,
        description,
        goalCompletion,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/plan/:id", async (req, res) => {
  try {
    await PlanList.update(
      { isComplete: true },
      { where: { id: req.params.id } }
    );
    res.status(200).json({ message: "Успешно" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
