const { Router } = require("express");
const checkToken = require("../middlewares/checkToken");
const goal = require("../models/goal");
const { Goal, PlanList } = require("../models/goal");
const User = require("../models/user");
const router = Router();

router.get("/", async (req, res) => {
  try {
    const planList = await Goal.findAll({
      include: [
        { model: User, as: "author", attributes: ["email", "id", "name"] },
        PlanList,
      ],
      attributes: {
        exclude: ["authorId"],
      },
    });
    res.status(200).json({ data: planList });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, as: "author", attributes: ["email", "id", "name"] },
        PlanList,
      ],
      attributes: {
        exclude: ["authorId"],
      },
    });

    res.status(200).json({ data: goal });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Ошибка сервера" });
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
      User.findOne({
        where: { id: req.user.id },
        include: ["name", "id", "email"],
      }),
    ]);

    res.status(201).json({
      message: "Цель создана",
      data: {
        plans: plans.map((plan) => ({
          name: plan.name,
          isComplete: false,
        })),
        author: user,
        title,
        description,
        goalCompletion,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/plan/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await PlanList.findOne({
      where: { id },
      include: [{ model: Goal, as: "goal" }],
    });

    if (!plan && plan.goal.authorId !== req.user.id) {
      res.status(404).json({ error: "Error data" });
    }
    plan.isComplete = true;
    await plan.save();
    res.status(200).json({ message: "Успешно" });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
