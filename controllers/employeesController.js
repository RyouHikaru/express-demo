const Employee = require("../model/Employee");

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({});
    if (!employees)
      return res.status(204).json({ message: "No records found." });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createNewEmployee = async (req, res) => {
  if (!req?.body?.firstname || !req?.body?.lastname)
    return res
      .status(400)
      .json({ message: "First and last names are required" });

  const { firstname, lastname } = req.body;

  if (!firstname || !lastname) {
    return res
      .status(400)
      .json({ message: "Missing firstname or lastname in request parameter." });
  }

  try {
    const result = await Employee.create({
      firstname: firstname,
      lastname: lastname,
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateEmployee = async (req, res) => {
  if (!req?.body?.id)
    return res
      .status(400)
      .json({ message: "Missing Employee ID in the request parameter." });

  const employee = await Employee.findById(req.body.id);

  if (!employee)
    return res
      .status(400)
      .json({ message: `Employee with an ID of ${req.body.id} is not found.` });

  if (req.body.firstname) employee.firstname = req.body.firstname;

  if (req.body.lastname) employee.lastname = req.body.lastname;

  try {
    const result = await employee.save();

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  if (!req?.body?.id)
    return res
      .status(400)
      .json({ message: "Missing Employee ID in the request parameter." });

  const employee = await Employee.findById(req.body.id).exec();

  if (!employee)
    return res
      .status(400)
      .json({ message: `Employee with an ID of ${req.body.id} is not found.` });

  try {
    const result = await Employee.deleteOne({ _id: req.body.id }).exec();

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getEmployee = async (req, res) => {
  if (!req?.params?.id)
    return res
      .status(400)
      .json({ message: "Missing Employee ID in the request parameter." });

  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee)
      return res.status(400).json({
        message: `Employee with an ID of ${req.params.id} is not found.`,
      });

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllEmployees,
  createNewEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
};
