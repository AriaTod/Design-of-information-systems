const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const gql = require('graphql-tag');

const products = require('./data/products');

const typeDefs = gql`
    type Product {
        id: ID!
        title: String!
        price: Float!
    }

    type Query {
        products: [Product!]!
        product(id: ID!): Product
    }

    type Mutation {
        createProduct(
            title: String!
            price: Float!
        ): Product!

        updateProduct(
            id: ID!
            title: String!
            price: Float!
        ): Product

        deleteProduct(id: ID!): Boolean!
    }
`;

const resolvers = {
    Query: {
        products: () => products,

        product: (_, { id }) => {
            return products.find(product => product.id === id);
        }
    },

    Mutation: {
        createProduct: (_, { title, price }) => {
            const newProduct = {
                id: String(products.length + 1),
                title,
                price
            };

            products.push(newProduct);

            return newProduct;
        },

        updateProduct: (_, { id, title, price }) => {
            const product = products.find(
                product => product.id === id
            );

            if (!product) {
                return null;
            }

            product.title = title;
            product.price = price;

            return product;
        },

        deleteProduct: (_, { id }) => {
            const index = products.findIndex(
                product => product.id === id
            );

            if (index === -1) {
                return false;
            }

            products.splice(index, 1);

            return true;
        }
    }
};

async function startServer() {
    const server = new ApolloServer({
        schema: buildSubgraphSchema({
            typeDefs,
            resolvers
        })
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4002 }
    });

    console.log(`Products Service running at ${url}`);
}

startServer();