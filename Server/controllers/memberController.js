import prisma from "../config/db.js";

// Create Member (Manager only)
export const createMember = async (req, res, next) => {
  try {
    if (req.user.role !== "MANAGER") {
      return res
        .status(403)
        .json({ error: "Only managers can create members" });
    }

    const {
      user_id,
      FirstName,
      LastName,
      phone,
      role,
      position,
      address,
      gender,
      dob,
      salary,
      joining_date,
      status,
      biography,
    } = req.body;

    const requiredFields = {
      user_id,
      FirstName,
      LastName,
      role,
      position,
      salary,
      joining_date,
      status,
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key]
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const user = await prisma.users.findUnique({ where: { id: user_id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingMember = await prisma.members.findUnique({
      where: { user_id },
    });
    if (existingMember) {
      return res
        .status(400)
        .json({ error: "A member already exists for this user" });
    }

    if (
      role.toUpperCase() !== user.role ||
      status.toUpperCase() !== user.status
    ) {
      return res.status(400).json({
        error: "Role and status must match the corresponding user's data",
      });
    }
    if (FirstName !== user.FirstName || LastName !== user.LastName) {
      return res.status(400).json({
        error:
          "FirstName and LastName must match the corresponding user's data",
      });
    }

    const memberData = {
      user_id,
      FirstName,
      LastName,
      phone: phone || null,
      position,
      address: address || null,
      certificate:
        req.files?.certificate && req.files.certificate[0]?.path
          ? req.files.certificate[0].path
          : null,
      photo:
        req.files?.photo && req.files.photo[0]?.path
          ? req.files.photo[0].path
          : null,
      gender: gender ? gender.toUpperCase() : null,
      dob: dob ? new Date(dob) : null,
      salary: parseFloat(salary),
      joining_date: new Date(joining_date),
      status: status.toUpperCase(),
      role: role.toUpperCase(),
      biography: biography || null,
    };

    const member = await prisma.members.create({ data: memberData });

    console.log("Created Member:", member);
    res.status(201).json({ message: "Member created successfully", member });
  } catch (error) {
    console.error("Error in createMember:", error);
    if (error.code === "ENOENT") {
      return res.status(500).json({
        error:
          "File upload failed: Unable to save file to the specified directory",
        details: error.message,
      });
    }
    next(error);
  }
};

// Get All Members (Manager gets all employee members, excluding self)
export const getAllMembers = async (req, res, next) => {
  try {
    if (req.user.role === "MANAGER") {
      const members = await prisma.members.findMany({
        where: {
          user_id: { not: req.user.id },
          role: "EMPLOYEE",
        },
        include: { user: true },
      });
      console.log("Fetched Members from DB:", members);
      res.status(200).json({ memberCount: members.length, members });
    } else if (req.user.role === "EMPLOYEE") {
      const member = await prisma.members.findUnique({
        where: { user_id: req.user.id },
        include: { user: true },
      });
      if (!member) {
        return res
          .status(404)
          .json({ error: "No member profile found for this employee" });
      }
      res.status(200).json({ memberCount: 1, members: [member] });
    } else {
      return res.status(403).json({ error: "Unauthorized role" });
    }
  } catch (error) {
    console.error("Error in getAllMembers:", error);
    next(error);
  }
};

// Get Member by ID (Manager sees any, employees see self)
export const getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await prisma.members.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (req.user.role === "EMPLOYEE" && member.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only view your own member profile" });
    }

    console.log("Fetched Member by ID:", member);
    res.status(200).json(member);
  } catch (error) {
    console.error(`Error in getMemberById for ID ${req.params.id}:`, error);
    next(error);
  }
};

// Update Member (Manager only)
export const updateMember = async (req, res, next) => {
  try {
    if (req.user.role !== "MANAGER") {
      return res
        .status(403)
        .json({ error: "Only managers can update members" });
    }

    const { id } = req.params;
    const {
      FirstName,
      LastName,
      phone,
      role,
      position,
      address,
      gender,
      dob,
      salary,
      joining_date,
      status,
      biography,
    } = req.body;

    const member = await prisma.members.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Sync FirstName and LastName to Users
    const userUpdates = {};
    if (FirstName && FirstName !== member.FirstName)
      userUpdates.FirstName = FirstName;
    if (LastName && LastName !== member.LastName)
      userUpdates.LastName = LastName;

    if (Object.keys(userUpdates).length > 0) {
      await prisma.users.update({
        where: { id: member.user_id },
        data: userUpdates,
      });
    }

    const memberUpdateData = {
      FirstName: FirstName ?? member.FirstName,
      LastName: LastName ?? member.LastName,
      phone: phone ?? member.phone,
      position: position ?? member.position,
      address: address ?? member.address,
      certificate:
        req.files?.certificate && req.files.certificate[0]?.path
          ? req.files.certificate[0].path
          : member.certificate,
      photo:
        req.files?.photo && req.files.photo[0]?.path
          ? req.files.photo[0].path
          : member.photo,
      gender: gender ? gender.toUpperCase() : member.gender,
      dob: dob ? new Date(dob) : member.dob,
      salary: salary !== undefined ? parseFloat(salary) : member.salary,
      joining_date: joining_date ? new Date(joining_date) : member.joining_date,
      status: status ? status.toUpperCase() : member.status,
      role: role ? role.toUpperCase() : member.role,
      biography: biography ?? member.biography,
    };

    const updatedMember = await prisma.members.update({
      where: { id },
      data: memberUpdateData,
    });

    console.log(`Updated Member ID: ${id}`, updatedMember);
    res.status(200).json({
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    console.error(`Error in updateMember for ID ${req.params.id}:`, error);
    if (error.code === "ENOENT") {
      return res.status(500).json({
        error:
          "File upload failed: Unable to save file to the specified directory",
        details: error.message,
      });
    }
    next(error);
  }
};

// Update Self Member (Employee only, restricted fields, sync to Users)
export const updateSelfMember = async (req, res, next) => {
  try {
    if (req.user.role !== "EMPLOYEE") {
      return res
        .status(403)
        .json({ error: "Only employees can update their own member profile" });
    }

    const member = await prisma.members.findUnique({
      where: { user_id: req.user.id },
      include: { user: true },
    });
    if (!member) {
      return res.status(404).json({ error: "Member profile not found" });
    }

    const { FirstName, LastName, phone, address, gender, dob, biography } =
      req.body;

    // Sync FirstName and LastName to Users
    const userUpdates = {};
    if (FirstName && FirstName !== member.FirstName)
      userUpdates.FirstName = FirstName;
    if (LastName && LastName !== member.LastName)
      userUpdates.LastName = LastName;

    if (Object.keys(userUpdates).length > 0) {
      await prisma.users.update({
        where: { id: req.user.id },
        data: userUpdates,
      });
    }

    // Restrict employee updates to allowed fields
    const memberUpdateData = {
      FirstName: FirstName ?? member.FirstName,
      LastName: LastName ?? member.LastName,
      phone: phone ?? member.phone,
      address: address ?? member.address,
      certificate:
        req.files?.certificate && req.files.certificate[0]?.path
          ? req.files.certificate[0].path
          : member.certificate,
      photo:
        req.files?.photo && req.files.photo[0]?.path
          ? req.files.photo[0].path
          : member.photo,
      gender: gender ? gender.toUpperCase() : member.gender,
      dob: dob ? new Date(dob) : member.dob,
      biography: biography ?? member.biography,
    };

    const updatedMember = await prisma.members.update({
      where: { id: member.id },
      data: memberUpdateData,
    });

    res.status(200).json({
      message: "Member profile updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    console.error("Error in updateSelfMember:", error);
    if (error.code === "ENOENT") {
      return res.status(500).json({
        error:
          "File upload failed: Unable to save file to the specified directory",
        details: error.message,
      });
    }
    next(error);
  }
};

// Delete Member (Manager only)
export const deleteMember = async (req, res, next) => {
  try {
    if (req.user.role !== "MANAGER") {
      return res
        .status(403)
        .json({ error: "Only managers can delete members" });
    }

    const { id } = req.params;

    const member = await prisma.members.findUnique({ where: { id } });
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (member.user_id === req.user.id) {
      return res
        .status(403)
        .json({ error: "Manager cannot delete their own member profile" });
    }

    await prisma.members.delete({ where: { id } });
    console.log("Deleted Member with ID:", id);
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteMember for ID ${req.params.id}:`, error);
    next(error);
  }
};
