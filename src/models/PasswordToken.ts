import mongoose from 'mongoose';
import moment from 'moment';

const hourFromNow = function () {
  return moment().add(1, 'hour');
};

const PasswordTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    default: hourFromNow,
  },
});

const PasswordToken = mongoose.model('PasswordToken', PasswordTokenSchema);

export default PasswordToken;