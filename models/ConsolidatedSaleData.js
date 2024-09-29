import mongoose from 'mongoose';

const ConsolidatedSaleDataSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  external_reference: { type: String, required: true },
  status: { type: String, required: true },
  dateCreated: { type: Date, required: true },
  total: { type: Number, required: true },
  personalData: {
    name: { type: String, required: true },
    surname: { type: String },
    email: { type: String, required: true },
    cel: { type: String },
    address: { type: String },
    altura: { type: String },
    city: { type: String },
    streets: { type: String },
    contact: { type: String },
    notes: { type: String },
    tipoVivienda: { type: String, required: true },
    piso: { type: String, required: true },
  },
  postalCode: { type: String },
  deliveryDate: { type: String },
  emailSent: { type: Boolean, default: false },
  quantity: { type: Number, required: true }, // Cantidad de botellas
});

const ConsolidatedSaleData = mongoose.model('ConsolidatedSaleData', ConsolidatedSaleDataSchema);

export default ConsolidatedSaleData;
