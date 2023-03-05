import { PrismaClient } from "@prisma/client";
import { gql } from "apollo-server";

const prisma = new PrismaClient();

import books from "../../data/books";
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

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    companies: [Company]
    branches: [Branch]
    employees: [Employee]
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
    branches: () => prisma.branch.findMany(),
    employees: () => prisma.employee.findMany(),
  },
};
