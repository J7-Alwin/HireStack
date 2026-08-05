const departmentSchemas = {
  Department: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "dept_123456",
      },
      name: {
        type: "string",
        example: "Engineering",
      },
      description: {
        type: "string",
        example: "Responsible for software development.",
      },
      companyId: {
        type: "string",
        example: "cmp_123456",
      },
      isActive: {
        type: "boolean",
        example: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  DepartmentResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        $ref: "#/components/schemas/Department",
      },
    },
  },

  DepartmentListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Department",
        },
      },
    },
  },

  CreateDepartmentRequest: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        example: "Engineering",
      },
      description: {
        type: "string",
        example: "Handles product development.",
      },
    },
  },

  UpdateDepartmentRequest: {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      description: {
        type: "string",
      },
    },
  },

  ChangeDepartmentStatusRequest: {
    type: "object",
    required: ["isActive"],
    properties: {
      isActive: {
        type: "boolean",
        example: true,
      },
    },
  },

  DepartmentOption: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "cmsxxxxxxxx",
      },
      name: {
        type: "string",
        example: "Engineering",
      },
    },
  },

  DepartmentOptionsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Department options retrieved successfully",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/DepartmentOption",
        },
      },
    },
  },
};

export default departmentSchemas;
