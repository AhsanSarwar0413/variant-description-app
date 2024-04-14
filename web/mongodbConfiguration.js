import mongoose from 'mongoose'

mongoose.connect('mongodb+srv://waleed:ahsan123@cluster0.admdmff.mongodb.net/variantDescriptionDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//defining orderStatus Collection
const VariantDescriptionsSchema = new mongoose.Schema({
    varaintID: String,
    description: String,
});

//Creating OrderStatus Model
export const VaraintDescriptionDB = mongoose.model('VariantDescriptions', VariantDescriptionsSchema);
