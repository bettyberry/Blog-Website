import { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { motion } from "framer-motion";
import { FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

const contactSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  message: z.string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message cannot exceed 1000 characters" })
});

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    try {
      contactSchema.pick({ [name]: true }).parse({ [name]: value });
      setErrors(prev => ({ ...prev, [name]: "" }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [name]: error.errors[0].message }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: "", type: "" });

    try {
      contactSchema.parse(formData); 
      
      setErrors({});

      const response = await axios.post(`${API}/contact`, formData);

      setStatus({
        message: response.data.message,
        type: "success"
      });

      setFormData({ name: "", email: "", message: "" });
      setTouched({ name: false, email: false, message: false });

    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = {};
        error.errors.forEach((err) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
        setStatus({
          message: "Please correct the errors below",
          type: "error"
        });
      } else if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          const field = err.split(' ')[0].toLowerCase();
          serverErrors[field] = err;
        });
        setErrors(serverErrors);
        setStatus({
          message: error.response.data.message || "Validation failed",
          type: "error"
        });
      } else {
        setStatus({
          message: error.response?.data?.message || "An error occurred. Please try again later.",
          type: "error"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto p-8 mt-12 bg-white rounded-xl shadow-lg border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h2>
        <p className="text-gray-600">We'd love to hear from you</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                errors.name 
                  ? "border-red-400 focus:ring-red-200" 
                  : "border-gray-300 focus:border-blue-400 focus:ring-blue-200"
              }`}
              placeholder="Betelhem Tekle"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
            {errors.name && (
              <div className="absolute right-3 top-3.5 text-red-500">
                <FiAlertCircle className="h-5 w-5" />
              </div>
            )}
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FiAlertCircle className="mr-1" /> {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                errors.email 
                  ? "border-red-400 focus:ring-red-200" 
                  : "border-gray-300 focus:border-blue-400 focus:ring-blue-200"
              }`}
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
            {errors.email && (
              <div className="absolute right-3 top-3.5 text-red-500">
                <FiAlertCircle className="h-5 w-5" />
              </div>
            )}
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FiAlertCircle className="mr-1" /> {errors.email}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              id="message"
              name="message"
              rows="5"
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                errors.message 
                  ? "border-red-400 focus:ring-red-200" 
                  : "border-gray-300 focus:border-blue-400 focus:ring-blue-200"
              }`}
              placeholder="How can we help you?"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            ></textarea>
            {errors.message && (
              <div className="absolute right-3 top-3 text-red-500">
                <FiAlertCircle className="h-5 w-5" />
              </div>
            )}
          </div>
          {errors.message && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FiAlertCircle className="mr-1" /> {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-xl text-white bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 shadow-md font-semibold text-lg tracking-wide transition-all duration-300 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Send Message</span>
              <FiSend className="h-5 w-5" />
            </div>
          )}
        </motion.button>

        {/* Status Message */}
        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-start space-x-3 ${
              status.type === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {status.type === "success" ? (
              <FiCheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <FiAlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <p>{status.message}</p>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
