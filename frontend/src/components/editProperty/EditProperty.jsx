import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import PropertyService from '../../services/PropertyService'
import AuthService from '../../services/AuthService'

function EditProperty({ property, onClose, prId, onUpdate }) {
    // Form state initialized with property data
    const [description, setDescription] = useState(property.description || "");
    const [address, setAddress] = useState(property.address || "");
    const [area, setArea] = useState(property.area || 0);
    const [areaUnit, setAreaUnit] = useState(property.areaUnit || "sq_feet");
    const [monthlyRent, setMonthlyRent] = useState(property.monthlyRent || 0);
    const [noOfBedrooms, setNoOfBedrooms] = useState(property.noOfBedrooms || 0);
    const [securityDeposit, setSecurityDeposit] = useState(property.securityDepositAmount || '');
    const [minStay, setMinStay] = useState(property.minStay || 0);
    const [petsPolicy, setPetsPolicy] = useState(property.petsPolicy || "");
    const [isSmokingAllowed, setIsSmokingAllowed] = useState(property.smokingAllowed || false);
    const [otherRules, setOtherRules] = useState(property.otherRules || "");

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const navigate = useNavigate();

    const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

    // Property data object
    const propertyData = {
        "description": description,
        "address": address,
        "area": area,
        "areaUnit": areaUnit,
        "monthlyRent": monthlyRent,
        "noOfBedrooms": noOfBedrooms,
        "securityDepositAmount": securityDeposit,
        "minStay": minStay,
        "petsPolicy": petsPolicy,
        "smokingAllowed": isSmokingAllowed,
        "otherRules": otherRules
    };

    // Form validation
    const validateForm = () => {
        const errors = [];
        if (!description.trim()) errors.push("Description is required");
        if (!address.trim()) errors.push("Address is required");
        if (!area || area <= 0) errors.push("Valid area is required");
        if (!monthlyRent || monthlyRent <= 0) errors.push("Valid monthly rent is required");
        if (!noOfBedrooms || noOfBedrooms <= 0) errors.push("Number of bedrooms is required");
        if (securityDeposit < 0) errors.push("Security deposit cannot be negative");
        return errors;
    };

    // !HANDLE EDIT PROPERTY
    const handleEditProperty = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setSubmitMessage(`Please fix the following errors: ${validationErrors.join(', ')}`);
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage('Updating property...');

        try {
            const response = await PropertyService.editProperty(propertyData, prId);
            if (response) {
                setSubmitMessage('Pass: ✅ Property updated successfully!');
                // Call the onUpdate callback with updated data
                onUpdate && onUpdate({ ...property, ...propertyData });

                // Close modal after a brief delay
                setTimeout(() => {
                    onClose && onClose();
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            setSubmitMessage(`❌ Update failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Property</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleEditProperty} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ADDRESS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                            </label>
                            <input
                                type='text'
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className={inputClassName}
                                rows="3"
                                placeholder="Describe your property..."
                                required
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={inputClassName}
                                rows="3"
                                placeholder="Full address..."
                                required
                            />
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* AREA */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Area *
                            </label>
                            <input
                                type="number"
                                value={area}
                                onChange={(e) => setArea(Number(e.target.value))}
                                className={inputClassName}
                                placeholder="e.g., 1200"
                                min="1"
                                required
                            />
                        </div>

                        {/* AREA UNIT */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Area Unit
                            </label>
                            <select
                                value={areaUnit}
                                onChange={(e) => setAreaUnit(e.target.value)}
                                className={inputClassName}
                            >
                                <option value="sq_feet">Square Feet</option>
                                <option value="sq_meter">Square Meter</option>
                            </select>
                        </div>

                        {/* NO OF BEDROOMS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bedrooms *
                            </label>
                            <input
                                type="number"
                                value={noOfBedrooms}
                                onChange={(e) => setNoOfBedrooms(Number(e.target.value))}
                                className={inputClassName}
                                placeholder="e.g., 3"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    {/* Financial Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* MONTHLY RENT */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Monthly Rent (₹) *
                            </label>
                            <input
                                type="number"
                                value={monthlyRent}
                                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                                className={inputClassName}
                                placeholder="e.g., 25000"
                                min="1"
                                required
                            />
                        </div>

                        {/* SECURITY DEPOSIT */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Security Deposit (₹) *
                            </label>
                            <input
                                type="number"
                                value={securityDeposit}
                                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                                className={inputClassName}
                                placeholder="e.g., 50000"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* MINIMUM STAY */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Minimum Stay (months)
                            </label>
                            <input
                                type="number"
                                value={minStay}
                                onChange={(e) => setMinStay(Number(e.target.value))}
                                className={inputClassName}
                                placeholder="e.g., 11"
                                min="0"
                            />
                        </div>

                        {/* PETS POLICY */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pets Policy
                            </label>
                            <input
                                type="text"
                                value={petsPolicy}
                                onChange={(e) => setPetsPolicy(e.target.value)}
                                className={inputClassName}
                                placeholder="e.g., No pets allowed"
                            />
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="space-y-4">
                        {/* SMOKING ALLOWED FLAG */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isSmokingAllowed}
                                onChange={(e) => setIsSmokingAllowed(e.target.checked)}
                                id="isSmokingAllowed"
                                className="mr-2"
                            />
                            <label htmlFor="isSmokingAllowed" className="text-sm font-medium text-gray-700">
                                Smoking Allowed
                            </label>
                        </div>

                        {/* OTHER RULES */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Other Rules
                            </label>
                            <textarea
                                value={otherRules}
                                onChange={(e) => setOtherRules(e.target.value)}
                                className={inputClassName}
                                rows="3"
                                placeholder="Any additional rules or requirements..."
                            />
                        </div>
                    </div>

                    {/* Status Message */}
                    {submitMessage && (
                        <div className={`p-4 rounded-md ${submitMessage.includes('Pass')
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            {submitMessage}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2 rounded-md font-medium transition-colors cursor-pointer ${isSubmitting
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProperty