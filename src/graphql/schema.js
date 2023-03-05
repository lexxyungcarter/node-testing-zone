import { PrismaClient } from "@prisma/client";
import { gql } from "apollo-server";

const prisma = new PrismaClient();

//Prisma middleware
prisma.$use(async (params, next) => {
  if (params.model === "Order") {
    // run  query
    const result = await next(params);

    if (["findMany"].includes(params.action)) {
      // split items
      const modified = result.map((res) => ({
        ...res,
        items: res.items.split(","),
      }));

      return modified;
    }

    if (["findUnique", "update"].includes(params.action)) {
      // split items
      const modified = {
        ...result,
        items: result.items.split(","),
      };

      return modified;
    }
  }

  return next(params);
});

import books from "../../data/books.js";
// import companies from '../data/company';
// import branches from '../data/branch';
// import employees from '../data/employee'

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
export const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # This "Company" type defines the queryable fields for every company in our data source.
  type Company {
    id: Int!
    name: String!
    description: String
    branches: [Branch]
  }

  # This "Branch" type defines the queryable fields for every branch in our data source.
  type Branch {
    id: Int!
    title: String!
    city: String
    country: String
    company: Company!
    employees: [Employee]
  }

  # This "Employee" type defines the queryable fields for every employee in our data source.
  type Employee {
    id: Int!
    firstName: String!
    lastName: String!
    role: String
    branch: Branch!
    company: Company!
  }

  # Orders
  enum OrderStatus {
    PENDING
    PAID
    IN_PROGRESS
    IN_DELIVERY
    DELIVERED
  }

  type Order {
    id: Int!
    deliveryAddress: String!
    items: [String]!
    total: Float!
    discountCode: String
    comment: String
    status: OrderStatus!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    companies: [Company]
    branches: [Branch]
    employees: [Employee]
    company(id: Int!): Company
    orders: [Order]
    order(id: Int!): Order
  }

  # Inputs to be used in CRUD operations
  input CompanyInput {
    name: String!
    description: String
    branches: [BranchesInput]
  }

  input BranchesInput {
    title: String!
    city: String
    country: String
  }

  # Mutations for the app
  type Mutation {
    createCompany(
      name: String!
      branches: [BranchesInput]
      description: String
    ): Company

    createOrder(
      deliveryAddress: String!
      items: [String]!
      total: Float!
      discountCode: String
      comment: String
      status: OrderStatus!
    ): Order

    updateOrderStatus(id: Int!, status: OrderStatus!): Order
  }
`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
export const resolvers = {
  Query: {
    books: () => books,
    companies: () => {
      return prisma.company.findMany();
    },
    company: (_parent, args) =>
      prisma.company.findUnique({
        where: { id: args.id },
      }),
    branches: () => prisma.branch.findMany(),
    employees: () => prisma.employee.findMany(),
    orders: () => prisma.order.findMany(),
    order: (_parent, args) =>
      prisma.order.findUnique({ where: { id: args.id } }),
  },
  Mutation: {
    createCompany: async (root, args) => {
      return prisma.company.create({
        data: {
          name: args.name,
          description: args.description,
          // branches: [],
        },
      });
    },

    createOrder: async (root, args) => {
      const items = args.items.join(",");

      return prisma.order.create({
        data: {
          deliveryAddress: args.deliveryAddress,
          total: args.total,
          discountCode: args.discountCode,
          comment: args.comment,
          status: args.status,
          items: items,
        },
      });
    },

    updateOrderStatus: (_parent, args) => {
      return prisma.order.update({
        where: {
          id: args.id,
        },
        data: {
          status: args.status,
        },
      });
    },
  },
};
