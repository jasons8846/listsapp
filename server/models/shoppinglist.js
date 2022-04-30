const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ShoppingListSchema = new mongoose.Schema({
    item: String,
    strike: String,
    user: String
});

const ShoppingList = mongoose.model('ShoppingList', ShoppingListSchema);
module.exports = ShoppingList;