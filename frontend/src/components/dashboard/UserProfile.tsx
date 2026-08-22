"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FiCamera, FiEdit2, FiPlus, FiMapPin } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import ErrorMessage from "@/components/common/Error";
import userService from "@/services/userService";
import { getImageUrl } from "@/utils/imageUtils";
import { PHONE_MAX_LENGTH, PHONE_PLACEHOLDER } from "@/utils/phone";
import axios from "@/utils/axios";
import type {
  User,
  Address,
  UpdateUserInfoRequest,
  AddAddressRequest,
  UpdateAddressRequest,
  ApiResponse,
} from "@/types";

interface UserProfileProps {
  user: User;
}

interface ProfileFormData {
  name: string;
  phone: string;
}

interface StatusState {
  type: "success" | "error" | "";
  message: string;
}

export default function UserProfile({
  user: initialUser,
}: UserProfileProps): React.JSX.Element {
  const [user, setUser] = useState<User>(initialUser);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user?.addresses?.[0]?._id || ""
  );
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialUser?.name || "",
    phone: initialUser?.phone || "",
  });
  const [addressFormData, setAddressFormData] = useState<AddAddressRequest>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    isDefault: false,
  });
  const [status, setStatus] = useState<StatusState>({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
      // Set the selected address to the default address if it exists
      const defaultAddress = user.addresses?.find(
        (addr: Address) => addr.isDefault
      );
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id || "");
      } else if (user.addresses?.[0]) {
        setSelectedAddressId(user.addresses[0]._id || "");
      }
    }
  }, [user]);

  const handleImageClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setStatus({
        type: "error",
        message: "Please upload a valid image file (JPEG, PNG, or WebP)",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setStatus({
        type: "error",
        message: "Image size should be less than 5MB",
      });
      return;
    }

    try {
      setIsUploading(true);
      setStatus({ type: "", message: "" });

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axios.put<ApiResponse<{ user: User }>>(
        `${API_URL}/users/profile/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to upload image");
      }

      // Update local user state and localStorage
      if (response.data.payload?.user) {
        setUser(response.data.payload.user);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.payload.user)
        );
      }

      setStatus({
        type: "success",
        message: "Profile picture updated successfully",
      });
    } catch (err: any) {
      console.error("Profile picture upload error:", err);
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value, type, checked } = e.target;
    setAddressFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setSelectedAddressId(e.target.value);
  };

  const handleEditAddress = (): void => {
    const selectedAddress = user.addresses.find(
      (addr) => addr._id === selectedAddressId
    );
    if (selectedAddress) {
      setAddressFormData({
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode || "",
        isDefault: selectedAddress.isDefault,
      });
      setShowAddressForm(true);
    }
  };

  const handleAddNewAddress = (): void => {
    setAddressFormData({
      street: "",
      city: "",
      state: "",
      postalCode: "",
      isDefault: false,
    });
    setSelectedAddressId(""); // Clear selected address when adding new
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      let updatedUserResponse: ApiResponse<{ user: User }>;

      if (showAddressForm) {
        if (selectedAddressId) {
          // Update existing address - use UpdateAddressRequest type
          const updateData: UpdateAddressRequest = {
            street: addressFormData.street,
            city: addressFormData.city,
            state: addressFormData.state,
            postalCode: addressFormData.postalCode,
            isDefault: addressFormData.isDefault,
          };

          updatedUserResponse = await userService.updateAddress(
            user._id,
            selectedAddressId,
            updateData
          );
        } else {
          // Add new address - use AddAddressRequest type
          const newAddressData: AddAddressRequest = {
            street: addressFormData.street,
            city: addressFormData.city,
            state: addressFormData.state,
            postalCode: addressFormData.postalCode || "",
            isDefault: addressFormData.isDefault,
          };

          updatedUserResponse = await userService.addAddress(
            user._id,
            newAddressData
          );

          // If this is the first address or isDefault is true, update UI accordingly
          if (!user.addresses?.length || addressFormData.isDefault) {
            const newUser = updatedUserResponse.payload?.user;
            if (newUser?.addresses) {
              const newAddress =
                newUser.addresses[newUser.addresses.length - 1];
              setSelectedAddressId(newAddress._id || "");
            }
          }
        }
        setShowAddressForm(false);
      } else if (selectedAddressId) {
        // Just updating default status
        const selectedAddress = user.addresses.find(
          (addr) => addr._id === selectedAddressId
        );
        if (selectedAddress) {
          const updateData: UpdateAddressRequest = {
            ...selectedAddress,
            isDefault: true,
          };

          updatedUserResponse = await userService.updateAddress(
            user._id,
            selectedAddressId,
            updateData
          );
        } else {
          throw new Error("Selected address not found");
        }
      } else {
        throw new Error("No address selected for update");
      }

      if (updatedUserResponse.success && updatedUserResponse.payload?.user) {
        setStatus({
          type: "success",
          message: selectedAddressId
            ? "Address updated successfully"
            : "New address added successfully",
        });
        setUser(updatedUserResponse.payload.user);
        localStorage.setItem(
          "user",
          JSON.stringify(updatedUserResponse.payload.user)
        );

        // If no address was previously selected, select the newly added one
        if (
          !selectedAddressId &&
          updatedUserResponse.payload.user.addresses?.length > 0
        ) {
          const newAddress =
            updatedUserResponse.payload.user.addresses[
              updatedUserResponse.payload.user.addresses.length - 1
            ];
          setSelectedAddressId(newAddress._id || "");
        }
      }
    } catch (error: any) {
      console.error("Address update error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to update address",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // Use UpdateUserInfoRequest type for type safety
      const updateData: UpdateUserInfoRequest = {
        name: formData.name,
        phone: formData.phone,
      };

      const updatedUserResponse = await userService.updateProfile(
        user._id,
        updateData
      );

      if (updatedUserResponse.success && updatedUserResponse.payload?.user) {
        setStatus({
          type: "success",
          message: "Profile updated successfully",
        });
        setIsEditing(false);
        setUser(updatedUserResponse.payload.user);
        localStorage.setItem(
          "user",
          JSON.stringify(updatedUserResponse.payload.user)
        );
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: Address): string => {
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
    return address.isDefault ? `${fullAddress} (Default)` : fullAddress;
  };

  const formatAddressShort = (address: Address): string => {
    // Create a shorter version for mobile display
    const parts = [];
    if (address.street) parts.push(address.street.substring(0, 30));
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    
    const shortAddress = parts.join(', ');
    const suffix = address.isDefault ? ' (Default)' : '';
    
    // Truncate if too long
    if (shortAddress.length > 50) {
      return shortAddress.substring(0, 50) + '...' + suffix;
    }
    return shortAddress + suffix;
  };

  if (isLoading || !formData) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-muted-foreground">
              Loading profile data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
      <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <CardTitle className="text-xl font-semibold">
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 lg:p-8">
        {status.message && (
          <ErrorMessage
            type={status.type}
            message={status.message}
            className="mb-4"
          />
        )}

        {/* Enhanced Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <div
              className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 shadow-lg ring-4 ring-slate-200 dark:ring-slate-700"
              onClick={handleImageClick}
            >
              {user.profilePicture ? (
                <Image
                  src={getImageUrl(user.profilePicture)}
                  alt={user.name}
                  fill
                  className="object-cover"
                  priority={true}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white text-3xl lg:text-4xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <FiCamera className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            {isUploading && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800 shadow-md">
                  <Spinner size="sm" className="mr-1" />
                  Uploading...
                </Badge>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.name}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {user.email}
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="transition-all duration-200 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </Label>
              <div className="flex">
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength={PHONE_MAX_LENGTH}
                  placeholder={PHONE_PLACEHOLDER}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="p-1.5 bg-rose-100 dark:bg-rose-950/30 rounded-lg">
                <FiMapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              Delivery Address
            </Label>
            <div className="flex gap-3">
              <select
                value={selectedAddressId}
                onChange={handleAddressSelect}
                className="flex-1 h-11 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 overflow-hidden text-ellipsis"
                disabled={!user.addresses?.length}
                title={user.addresses?.find((addr) => addr._id === selectedAddressId) ? formatAddress(user.addresses.find((addr) => addr._id === selectedAddressId)!) : ''}
              >
                {user.addresses?.length ? (
                  user.addresses.map((address) => (
                    <option 
                      key={address._id} 
                      value={address._id}
                      title={formatAddress(address)}
                    >
                      {formatAddressShort(address)}
                    </option>
                  ))
                ) : (
                  <option value="">No addresses added</option>
                )}
              </select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleEditAddress}
                disabled={!selectedAddressId}
                title="Edit selected address"
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex-shrink-0"
              >
                <FiEdit2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddNewAddress}
                title="Add new address"
                className="bg-rose-600 hover:bg-rose-700 border-0 text-white flex-shrink-0"
              >
                <FiPlus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Show full address details below select on mobile */}
            {selectedAddressId && user.addresses?.length && (
              <div className="lg:hidden p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Selected Address:
                </p>
                <p className="text-sm text-slate-900 dark:text-white break-words leading-relaxed">
                  {formatAddress(user.addresses.find((addr) => addr._id === selectedAddressId)!)}
                </p>
              </div>
            )}
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <Card className="border-2 border-dashed border-rose-300 dark:border-rose-700 bg-rose-50/30 dark:bg-rose-950/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-rose-900 dark:text-rose-100">
                  {selectedAddressId ? "Edit Address" : "Add New Address"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="street" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Street Address
                  </Label>
                  <Input
                    id="street"
                    name="street"
                    value={addressFormData.street}
                    onChange={handleAddressChange}
                    placeholder="Enter your street address"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={addressFormData.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="state" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={addressFormData.state}
                      onChange={handleAddressChange}
                      placeholder="State"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="postalCode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={addressFormData.postalCode}
                      onChange={handleAddressChange}
                      placeholder="Postal Code"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={handleAddressChange}
                    className="w-4 h-4 text-rose-600 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-rose-500/20"
                  />
                  <Label htmlFor="isDefault" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Set as default address
                  </Label>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleAddressSubmit}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        {selectedAddressId ? "Updating..." : "Adding..."}
                      </>
                    ) : selectedAddressId ? (
                      "Update Address"
                    ) : (
                      "Add Address"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  <span className="text-white">Saving...</span>
                </>
              ) : isEditing ? (
                <span className="text-white">Save Changes</span>
              ) : (
                <span className="text-white">Edit Profile</span>
              )}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || "",
                    phone: user.phone || "",
                  });
                }}
                className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
