import React, { useState, useEffect } from "react";
import {
  Dumbbell,
  MapPin,
  Phone,
  Mail,
  Users,
  Timer,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainers, setTrainers] = useState([]); // State to store trainers data

  // Fetch trainers from the backend
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/trainer/all-trainers",
          { withCredentials: true }
        );
        if (response.data.trainers) {
          setTrainers(response.data.trainers);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch trainers"
        );
      }
    };

    fetchTrainers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:4000/auth/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 10000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Navigation Buttons */}
      <div className="fixed top-8 right-8 z-50">
        <button
          onClick={() => navigate("/login")}
          className="bg-red-600 text-white px-6 py-2 rounded-lg mr-4 hover:bg-red-700 transition duration-300"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-300"
        >
          Sign Up
        </button>
      </div>

      {/* Hero Section */}
      <div
        className="h-screen bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop')",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4 flex items-center justify-center">
              <Dumbbell className="mr-4" size={56} />
              G.Fitness
            </h1>
            <p className="text-2xl mb-8">Where Strength Meets Excellence</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose G.Fitness?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Shield className="w-16 h-16 text-red-600" />,
                title: "Premium Equipment",
                description:
                  "Latest state-of-the-art fitness equipment from top brands",
              },
              {
                icon: <Users className="w-16 h-16 text-red-600" />,
                title: "Expert Trainers",
                description:
                  "Certified professional trainers to guide your fitness journey",
              },
              {
                icon: <Timer className="w-16 h-16 text-red-600" />,
                title: "24/7 Access",
                description:
                  "Train anytime with our round-the-clock facility access",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex justify-center mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trainers Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Meet Our Trainers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainers.map((trainer, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {/* Trainer Image */}
                <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                  {trainer.imageUrl ? (
                    <img
                      src={trainer.imageUrl}
                      alt={trainer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-lg">Profile Image</span>
                  )}
                </div>

                {/* Trainer Details */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{trainer.name}</h3>
                  <p className="text-red-600 mb-2">{trainer.specialty}</p>
                  <p className="text-gray-600">
                    Experience: {trainer.experience} years
                  </p>
                  <p className="text-gray-600">{trainer.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Get In Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-red-600 mr-4" />
                  <p>123 Fitness Street, Gym City, GC 12345</p>
                </div>
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-red-600 mr-4" />
                  <p>(555) 123-4567</p>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-red-600 mr-4" />
                  <p>info@gfitness.com</p>
                </div>
              </div>
            </div>
            <div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-600"
                    rows={4}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className={`bg-red-600 text-white px-6 py-2 rounded-lg transition duration-300 ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-red-700"
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="mr-2" />
            <span className="text-xl font-bold">G.Fitness</span>
          </div>
          <p className="text-gray-400">
            © 2024 G.Fitness. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
