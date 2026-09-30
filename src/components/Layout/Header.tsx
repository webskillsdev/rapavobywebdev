import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { useLogoutMutation } from "../../api/authApi";
import { clearUser } from "../../store/authSlice";
import rapavoIcon from "../../assets/rapavo-icon.png";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [logout] = useLogoutMutation();

  async function handleLogout() {
    await logout({});
    dispatch(clearUser());
    navigate("/");
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <Link to="/" className="flex items-center gap-2">
        <img src={rapavoIcon} alt="RAPAVO" className="h-8 w-auto" />
                <span className="flex flex-col leading-none">
          <span className="text-xl font-bold text-gray-900">RAPAVO</span>
          <span className="text-[10px] text-black">
            The <span className="text-green-600">Smarter</span> Way to Property
          </span>
        </span>
      </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                <Link
          to={
            !isAuthenticated
              ? "/"
              : user?.currentMode === "agent"
              ? "/agent-dashboard"
              : "/dashboard"
          }
          className="hover:text-green-600"
        >
          Home
        </Link>
        <Link to="/" className="hover:text-green-600">Explore</Link>
        {isAuthenticated && (
          <Link to="/post-property" className="hover:text-green-600">List a Property</Link>
        )}
      </nav>

      {isAuthenticated && user ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.fullName} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="h-8 w-8 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                {user.initials || "?"}
              </span>
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              {user.fullName || user.email}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Log Out
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Log In / Sign Up
        </Link>
      )}
    </header>
  );
}

export default Header;