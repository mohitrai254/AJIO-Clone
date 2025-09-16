export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#1f3646] text-gray-200 text-sm mt-10 relative">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Column 1: Ajio */}
        <div>
          <h5 className="font-semibold mb-3">Ajio</h5>
          <ul className="space-y-1">
            <li>
              <a href="#" className="hover:underline">
                Who We Are
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Join Our Team
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                We Respect Your Privacy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Fees & Payments
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Returns & Refunds Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Promotions Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Blog
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: Help */}
        <div>
          <h5 className="font-semibold mb-3">Help</h5>
          <ul className="space-y-1">
            <li>
              <a href="#" className="hover:underline">
                Track Your Order
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Frequently Asked Questions
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Returns
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Cancellations
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Payments
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Customer Care
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                How Do I Redeem My Coupon
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Shop by */}
        <div>
          <h5 className="font-semibold mb-3">Shop by</h5>
          <ul className="space-y-1">
            <li>
              <a href="#" className="hover:underline">
                All
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Men
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Women
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Kids
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Indie
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Stores
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                New Arrivals
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Brand Directory
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Collections
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Follow us */}
        <div>
          <h5 className="font-semibold mb-3">Follow us</h5>
          <ul className="space-y-1">
            <li>
              <a href="#" className="hover:underline">
                Facebook
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Instagram - AJIOlife
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Instagram - AJIO LUXE
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Twitter
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Pinterest
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-600" />

      {/* Bottom row */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-300">
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Payment methods</span>
          <div className="flex gap-3 flex-wrap">
            <span>Net Banking</span>
            <span>Visa</span>
            <span>MasterCard</span>
            <span>Cash on Delivery</span>
            <span>Jio Money</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 md:mt-0">
          <span className="font-semibold">Secure systems</span>
          <span>🔒 SSL 256 BIT ENCRYPTION</span>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-white text-gray-700 w-10 h-10 rounded-full flex items-center justify-center shadow-md border hover:bg-gray-100 transition"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </footer>
  );
}
