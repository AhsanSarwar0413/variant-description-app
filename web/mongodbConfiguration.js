import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://waleed:ahsan123@cluster0.admdmff.mongodb.net/variantDescriptionDB');

//defining orderStatus Collection
const VariantDescriptionsSchema = new mongoose.Schema({
    variantData: Object,
    variantId: String,
    description: String,
});

//Creating OrderStatus Model
export const VaraintDescriptionDB = mongoose.model('VariantDescriptions', VariantDescriptionsSchema);
