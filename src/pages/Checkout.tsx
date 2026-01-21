import { useState, useCallback, useEffect } from "react";
import { Minus, Plus, CreditCard, Check, ExternalLink, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CheckoutHeader from "../components/header/CheckoutHeader";
import Footer from "../components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/hooks/useCart";
import { useAbandonedCart } from "@/hooks/useAbandonedCart";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import SavingsSummary from "@/components/checkout/SavingsSummary";
import UrgencyTimer from "@/components/checkout/UrgencyTimer";
import RewardsProgress from "@/components/checkout/RewardsProgress";
import MiniTestimonial from "@/components/checkout/MiniTestimonial";
import OrderStatsBadge from "@/components/checkout/OrderStatsBadge";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import PostPurchaseOffer from "@/components/checkout/PostPurchaseOffer";
import MobileStickyCheckout from "@/components/checkout/MobileStickyCheckout";
import FreeShippingBar from "@/components/cart/FreeShippingBar";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, subtotal, hasFreeShipping, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const { syncCart, markConverted, email: savedEmail, isSynced, cartId } = useAbandonedCart();
  const { initiateCheckout, isLoading: isStripeLoading, error: stripeError } = useStripeCheckout();
  
  const [currentStep, setCurrentStep] = useState(2); // Start at "Details" step
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [customerDetails, setCustomerDetails] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: ""
  });
  const [hasSeparateBilling, setHasSeparateBilling] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: ""
  });
  const [shippingOption, setShippingOption] = useState("standard");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [showPostPurchaseOffer, setShowPostPurchaseOffer] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const getShippingCost = () => {
    if (hasFreeShipping && shippingOption === "standard") return 0;
    switch (shippingOption) {
      case "express":
        return 15;
      case "overnight":
        return 35;
      default:
        return hasFreeShipping ? 0 : 10;
    }
  };
  
  const shipping = getShippingCost();
  const total = subtotal - discountAmount + shipping;

  const handleDiscountSubmit = () => {
    // Simulate discount validation
    if (discountCode.toLowerCase() === "save10") {
      setDiscountAmount(Math.round(subtotal * 0.1));
    }
    setShowDiscountInput(false);
  };

  const handleCustomerDetailsChange = (field: string, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
    
    // Sync cart when email is entered
    if (field === 'email' && value && items.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        syncCart(value, items, subtotal);
      }
    }
  };

  // Pre-fill email if we have one from cart recovery
  useEffect(() => {
    if (savedEmail && !customerDetails.email) {
      setCustomerDetails(prev => ({ ...prev, email: savedEmail }));
    }
  }, [savedEmail, customerDetails.email]);

  // Handle cancelled checkout return
  useEffect(() => {
    const cancelled = searchParams.get("cancelled");
    if (cancelled === "true") {
      toast.error("Checkout was cancelled. Your cart has been preserved.");
    }
  }, [searchParams]);

  const handleShippingAddressChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleBillingDetailsChange = (field: string, value: string) => {
    setBillingDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentDetailsChange = (field: string, value: string) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  };

  // Stripe Checkout handler
  const handleStripeCheckout = async () => {
    // Validate required fields
    if (!customerDetails.email || !customerDetails.firstName || !customerDetails.lastName) {
      toast.error("Please fill in all required customer details");
      return;
    }
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      toast.error("Please fill in all required shipping address fields");
      return;
    }

    setIsProcessing(true);
    setCurrentStep(3);

    const result = await initiateCheckout({
      customerEmail: customerDetails.email,
      customerFirstName: customerDetails.firstName,
      customerLastName: customerDetails.lastName,
      customerPhone: customerDetails.phone,
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      billingAddress: hasSeparateBilling ? {
        address: billingDetails.address,
        city: billingDetails.city,
        postalCode: billingDetails.postalCode,
        country: billingDetails.country,
      } : undefined,
      shippingMethod: shippingOption as "standard" | "express" | "overnight",
      discountCode: discountCode || undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      abandonedCartId: cartId || undefined,
    });

    if (!result.success) {
      setIsProcessing(false);
      setCurrentStep(2);
      
      if (result.configured === false) {
        toast.error(result.message || "Payment processing is not configured yet");
      } else {
        toast.error(result.error || "Checkout failed. Please try again.");
      }
    }
    // If successful, user will be redirected to Stripe
  };

  // Fallback simulated payment handler (when Stripe not configured)
  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    setCurrentStep(3); // Move to payment step
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate order number
    setOrderNumber(String(Math.floor(10000 + Math.random() * 90000)));
    
    // Mark abandoned cart as converted
    await markConverted();
    
    setIsProcessing(false);
    setPaymentComplete(true);
    setCurrentStep(4); // Complete step
  };

  const handleShowPostPurchaseOffer = useCallback(() => {
    setShowPostPurchaseOffer(true);
  }, []);

  const handleContinueShopping = () => {
    clearCart();
    navigate("/");
  };

  const handleAddPostPurchaseItem = () => {
    // Add the upsell item to cart
    console.log("Post-purchase item added");
  };

  // Scroll to payment section for mobile sticky bar
  const scrollToPayment = () => {
    document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // Empty cart state
  if (items.length === 0 && !paymentComplete) {
    return (
      <div className="min-h-screen bg-background">
        <CheckoutHeader />
        <main className="pt-12 pb-24">
          <div className="max-w-md mx-auto px-6 text-center">
            <h1 className="text-2xl font-light text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some items to your cart to continue shopping.
            </p>
            <Button onClick={() => navigate("/")} className="rounded-none">
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <CheckoutHeader />
      
      {/* Progress Stepper */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <CheckoutProgress currentStep={currentStep} />
        </div>
      </div>
      
      <main className="pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Order Summary - First on mobile, last on desktop */}
            <div className="lg:col-span-1 lg:order-2">
              <div className="bg-muted/20 p-6 lg:p-8 rounded-none sticky top-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-light text-foreground">Order Summary</h2>
                  <OrderStatsBadge />
                </div>
                
                {/* Free Shipping Progress */}
                <FreeShippingBar />
                
                {/* Urgency Timer */}
                <UrgencyTimer initialMinutes={15} type="cart" />
                
                {/* Cart Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-muted rounded-none overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-light text-foreground text-sm truncate">{item.name}</h3>
                        {item.size && (
                          <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                        )}
                        
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 p-0 rounded-none border-muted-foreground/20"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium text-foreground min-w-[2ch] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 p-0 rounded-none border-muted-foreground/20"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-foreground font-medium text-sm">
                        {item.priceFormatted}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Savings Summary */}
                <SavingsSummary discountAmount={discountAmount} />

                {/* Discount Code Section */}
                <div className="pt-4 border-t border-muted-foreground/20">
                  {!showDiscountInput ? (
                    <button 
                      onClick={() => setShowDiscountInput(true)}
                      className="text-sm text-foreground underline hover:no-underline transition-all"
                    >
                      Have a discount code?
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="Enter code (try SAVE10)"
                          className="flex-1 rounded-none text-sm"
                        />
                        <Button 
                          onClick={handleDiscountSubmit}
                          variant="outline"
                          className="rounded-none text-sm"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rewards Progress */}
                <RewardsProgress />

                {/* Price Breakdown */}
                <div className="border-t border-muted-foreground/20 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span className="text-foreground">€{subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600">Discount</span>
                      <span className="text-emerald-600">-€{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-emerald-600" : "text-foreground"}>
                      {shipping === 0 ? "FREE" : `€${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-medium pt-2 border-t border-muted-foreground/20">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">€{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Mini Testimonial */}
                <MiniTestimonial />
              </div>
            </div>

            {/* Left Column - Forms */}
            <div className="lg:col-span-2 lg:order-1 space-y-8">

              {paymentComplete ? (
                <OrderConfirmation
                  orderNumber={orderNumber}
                  email={customerDetails.email}
                  onContinueShopping={handleContinueShopping}
                  onShowPostPurchaseOffer={handleShowPostPurchaseOffer}
                />
              ) : (
                <>
                  {/* Customer Details Form */}
                  <div className="bg-muted/20 p-6 lg:p-8 rounded-none">
                    <h2 className="text-lg font-light text-foreground mb-6">Customer Details</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email" className="text-sm font-light text-foreground">
                            Email Address *
                          </Label>
                          {isSynced && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Check className="w-3 h-3" />
                              Cart saved
                            </span>
                          )}
                        </div>
                        <Input
                          id="email"
                          type="email"
                          value={customerDetails.email}
                          onChange={(e) => handleCustomerDetailsChange("email", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="Enter your email"
                        />
                        {savedEmail && customerDetails.email === savedEmail && (
                          <p className="mt-1.5 text-[10px] text-muted-foreground">
                            Email restored from your previous session
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-sm font-light text-foreground">
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={customerDetails.firstName}
                            onChange={(e) => handleCustomerDetailsChange("firstName", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-sm font-light text-foreground">
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={customerDetails.lastName}
                            onChange={(e) => handleCustomerDetailsChange("lastName", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-sm font-light text-foreground">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={customerDetails.phone}
                          onChange={(e) => handleCustomerDetailsChange("phone", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      {/* Shipping Address */}
                      <div className="border-t border-muted-foreground/20 pt-6 mt-8">
                        <h3 className="text-base font-light text-foreground mb-4">Shipping Address</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="shippingAddress" className="text-sm font-light text-foreground">
                              Address *
                            </Label>
                            <Input
                              id="shippingAddress"
                              type="text"
                              value={shippingAddress.address}
                              onChange={(e) => handleShippingAddressChange("address", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="Street address"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="shippingCity" className="text-sm font-light text-foreground">
                                City *
                              </Label>
                              <Input
                                id="shippingCity"
                                type="text"
                                value={shippingAddress.city}
                                onChange={(e) => handleShippingAddressChange("city", e.target.value)}
                                className="mt-2 rounded-none"
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <Label htmlFor="shippingPostalCode" className="text-sm font-light text-foreground">
                                Postal Code *
                              </Label>
                              <Input
                                id="shippingPostalCode"
                                type="text"
                                value={shippingAddress.postalCode}
                                onChange={(e) => handleShippingAddressChange("postalCode", e.target.value)}
                                className="mt-2 rounded-none"
                                placeholder="Postal code"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="shippingCountry" className="text-sm font-light text-foreground">
                              Country *
                            </Label>
                            <Input
                              id="shippingCountry"
                              type="text"
                              value={shippingAddress.country}
                              onChange={(e) => handleShippingAddressChange("country", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Billing Address Checkbox */}
                      <div className="border-t border-muted-foreground/20 pt-6 mt-8">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="separateBilling"
                            checked={hasSeparateBilling}
                            onCheckedChange={(checked) => setHasSeparateBilling(checked === true)}
                          />
                          <Label 
                            htmlFor="separateBilling" 
                            className="text-sm font-light text-foreground cursor-pointer"
                          >
                            Other billing address
                          </Label>
                        </div>
                      </div>

                      {/* Billing Details */}
                      {hasSeparateBilling && (
                        <div className="space-y-6 pt-4">
                          <h3 className="text-base font-light text-foreground">Billing Details</h3>
                          
                          <div>
                            <Label htmlFor="billingEmail" className="text-sm font-light text-foreground">
                              Email Address *
                            </Label>
                            <Input
                              id="billingEmail"
                              type="email"
                              value={billingDetails.email}
                              onChange={(e) => handleBillingDetailsChange("email", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="Enter billing email"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="billingFirstName" className="text-sm font-light text-foreground">
                                First Name *
                              </Label>
                              <Input
                                id="billingFirstName"
                                type="text"
                                value={billingDetails.firstName}
                                onChange={(e) => handleBillingDetailsChange("firstName", e.target.value)}
                                className="mt-2 rounded-none"
                                placeholder="First name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="billingLastName" className="text-sm font-light text-foreground">
                                Last Name *
                              </Label>
                              <Input
                                id="billingLastName"
                                type="text"
                                value={billingDetails.lastName}
                                onChange={(e) => handleBillingDetailsChange("lastName", e.target.value)}
                                className="mt-2 rounded-none"
                                placeholder="Last name"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="billingPhone" className="text-sm font-light text-foreground">
                              Phone Number
                            </Label>
                            <Input
                              id="billingPhone"
                              type="tel"
                              value={billingDetails.phone}
                              onChange={(e) => handleBillingDetailsChange("phone", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="Enter billing phone number"
                            />
                          </div>

                          <div>
                            <Label htmlFor="billingAddress" className="text-sm font-light text-foreground">
                              Address *
                            </Label>
                            <Input
                              id="billingAddress"
                              type="text"
                              value={billingDetails.address}
                              onChange={(e) => handleBillingDetailsChange("address", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="Street address"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="billingCity" className="text-sm font-light text-foreground">
                                City *
                              </Label>
                              <Input
                                id="billingCity"
                                type="text"
                                value={billingDetails.city}
                                onChange={(e) => handleBillingDetailsChange("city", e.target.value)}
                                className="mt-2 rounded-none"
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <Label htmlFor="billingPostalCode" className="text-sm font-light text-foreground">
                                Postal Code *
                              </Label>
                              <Input
                                id="billingPostalCode"
                                type="text"
                                value={billingDetails.postalCode}
                                onChange={(e) => handleBillingDetailsChange("postalCode", e.target.value)}
                                className="mt-2 rounded-none"
                                placeholder="Postal code"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="billingCountry" className="text-sm font-light text-foreground">
                              Country *
                            </Label>
                            <Input
                              id="billingCountry"
                              type="text"
                              value={billingDetails.country}
                              onChange={(e) => handleBillingDetailsChange("country", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Options */}
                  <div className="bg-muted/20 p-6 lg:p-8 rounded-none">
                    <h2 className="text-lg font-light text-foreground mb-6">Shipping Options</h2>
                    
                    <RadioGroup 
                      value={shippingOption} 
                      onValueChange={setShippingOption}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between p-4 border border-muted-foreground/20 rounded-none">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="standard" id="standard" />
                          <Label htmlFor="standard" className="font-light text-foreground">
                            Standard Shipping
                          </Label>
                        </div>
                        <div className="text-sm">
                          {hasFreeShipping ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">FREE ✓</span>
                          ) : (
                            <span className="text-muted-foreground">€10 • 3-5 business days</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-muted-foreground/20 rounded-none">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="express" id="express" />
                          <Label htmlFor="express" className="font-light text-foreground">
                            Express Shipping
                          </Label>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          €15 • 1-2 business days
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-muted-foreground/20 rounded-none">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="overnight" id="overnight" />
                          <Label htmlFor="overnight" className="font-light text-foreground">
                            Overnight Delivery
                          </Label>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          €35 • Next business day
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Payment Section */}
                  <div id="payment-section" className="bg-muted/20 p-6 lg:p-8 rounded-none">
                    <h2 className="text-lg font-light text-foreground mb-6">Payment Details</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="cardholderName" className="text-sm font-light text-foreground">
                          Cardholder Name *
                        </Label>
                        <Input
                          id="cardholderName"
                          type="text"
                          value={paymentDetails.cardholderName}
                          onChange={(e) => handlePaymentDetailsChange("cardholderName", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="Name on card"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardNumber" className="text-sm font-light text-foreground">
                          Card Number *
                        </Label>
                        <div className="relative mt-2">
                          <Input
                            id="cardNumber"
                            type="text"
                            value={paymentDetails.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                              if (value.length <= 19) {
                                handlePaymentDetailsChange("cardNumber", value);
                              }
                            }}
                            className="rounded-none pl-10"
                            placeholder="4242 4242 4242 4242"
                            maxLength={19}
                          />
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate" className="text-sm font-light text-foreground">
                            Expiry Date *
                          </Label>
                          <Input
                            id="expiryDate"
                            type="text"
                            value={paymentDetails.expiryDate}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
                              if (value.length <= 5) {
                                handlePaymentDetailsChange("expiryDate", value);
                              }
                            }}
                            className="mt-2 rounded-none"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-sm font-light text-foreground">
                            CVV *
                          </Label>
                          <Input
                            id="cvv"
                            type="text"
                            value={paymentDetails.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 3) {
                                handlePaymentDetailsChange("cvv", value);
                              }
                            }}
                            className="mt-2 rounded-none"
                            placeholder="123"
                            maxLength={3}
                          />
                        </div>
                      </div>

                      {/* Order Total Summary */}
                      <div className="bg-muted/10 p-6 rounded-none border border-muted-foreground/20 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="text-foreground">€{subtotal.toLocaleString()}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-600">Discount</span>
                            <span className="text-emerald-600">-€{discountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className={shipping === 0 ? "text-emerald-600" : "text-foreground"}>
                            {shipping === 0 ? "FREE" : `€${shipping}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-medium border-t border-muted-foreground/20 pt-3">
                          <span className="text-foreground">Total</span>
                          <span className="text-foreground">€{total.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Stripe Checkout Button - Primary */}
                      <div className="space-y-3">
                        <Button
                          onClick={handleStripeCheckout}
                          disabled={isProcessing || isStripeLoading || !customerDetails.email || !customerDetails.firstName || !customerDetails.lastName || !shippingAddress.address}
                          className="w-full rounded-none h-12 text-base bg-primary hover:bg-primary/90"
                        >
                          {isProcessing || isStripeLoading ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Preparing Checkout...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Pay with Stripe • €{total.toLocaleString()}
                            </>
                          )}
                        </Button>
                        
                        {stripeError && (
                          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-none">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{stripeError}</span>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground text-center">
                          You'll be redirected to Stripe's secure checkout
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-muted/20 px-4 text-muted-foreground">or test with simulated payment</span>
                        </div>
                      </div>

                      {/* Fallback Simulated Payment Button */}
                      <Button
                        onClick={handleCompleteOrder}
                        variant="outline"
                        disabled={isProcessing || !paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardholderName}
                        className="w-full rounded-none h-12 text-base"
                      >
                        {isProcessing ? "Processing..." : `Test Payment • €${total.toLocaleString()}`}
                      </Button>

                      {/* Security assurance */}
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full" />
                        100% Secure Checkout • Your data is never stored
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Sticky Checkout Bar */}
      {!paymentComplete && items.length > 0 && (
        <MobileStickyCheckout
          total={total}
          onPayNow={scrollToPayment}
          isProcessing={isProcessing}
        />
      )}

      {/* Post-Purchase Offer Modal */}
      <PostPurchaseOffer
        isOpen={showPostPurchaseOffer}
        onClose={() => setShowPostPurchaseOffer(false)}
        onAddToOrder={handleAddPostPurchaseItem}
      />
    </div>
  );
};

export default Checkout;
