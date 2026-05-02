const Employee = require("../models/Employee");
const cloudinary = require('../config/cloudinary');


const get_me = async (req, res) => {
  try {
    console.log("sdbjfhbaskjfcbs");

    const employee = await Employee.findOne({
      employeeId: req.user.employeeId,
    }).select("-userId");

    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee profile not found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateMyProfile = async (req, res) => {
  try {
    console.log("adjnfkasjdfn")
    const { address, mobileNumber, bankName, accountNo, ifsc } = req.body;

    const employee = await Employee.findOne({ employeeId: req.user.employeeId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // ✅ text fields update
    if (address) employee.address = address;
    if (mobileNumber) employee.mobileNumber = mobileNumber;
    if (bankName) employee.bankName = bankName;
    if (accountNo) employee.accountNo = accountNo;
    if (ifsc) employee.ifsc = ifsc;

    // ✅ IMAGE UPLOAD
    if (req.files && req.files.profileImage) {
      const file = req.files.profileImage;

      // ❌ old image delete (important)
      if (employee.cloudinaryId) {
        await cloudinary.uploader.destroy(employee.cloudinaryId);
      }

      // ✅ upload new image
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "employee_profiles",
        width: 300,
        crop: "scale"
      });

      employee.profileImage = result.secure_url;
      employee.cloudinaryId = result.public_id;
    }

    await employee.save();

    res.json(employee);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = { get_me,updateMyProfile };