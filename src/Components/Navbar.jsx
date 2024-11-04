import { useState, useEffect } from "react";
import styled from "styled-components";
import LogoImg from "./Assets/gym.png";
import { Link as LinkR, NavLink } from "react-router-dom";
import { MenuRounded } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import Profile from "../Pages/Profile";
import { getProfileData, updateProfileData, getDashboardDetails } from "../api";
import { PropTypes } from "prop-types";
import imageCompression from 'browser-image-compression-extension';
import Lottie from "lottie-react";
import Streak from "./Assets/Animations/streak.json";
import StreakRed from "./Assets/Animations/streak_red.json";
import StreakOrange from "./Assets/Animations/streak_orange.json";
import StreakYellow from "./Assets/Animations/streak_yellow.json";
import { Tooltip } from '@mui/material';


const ProfileIcon = styled.div`
  cursor:pointer;
`;
const Nav = styled.div`
  background-color: ${({ theme }) => theme.bg};
  padding:0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  color: white;
  border-bottom: 1px solid ${({ theme }) => theme.text_secondary};
  width: 100%;
  overflow:hidden;
`;
const NavContainer = styled.div`
  width: 100%;
  padding: 0;
  display: flex;
  align-items:center;
  justify-content: space-between;
  font-size: 1rem;
`;
const NavLogoDiv = styled.div`
  height:100vh;
  display:flex;
  align-items:center;
  
`;
const Logo = styled.img`
  height: 42px;
  margin-right:10px;
`;

const AppName = styled.div`
  display:flex;
  height:100vh;
  align-items:center;
  flex-direction:row;
  font-size:24px;
  font-weight:600;
  color:${({ theme }) => (theme.theme==='true'?theme.white:theme.black)};
`;

const Header_text = styled.span`
  font-size:28px;
  color:#007bff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
`;

const Mobileicon = styled.div`
  color: ${({ theme }) => theme.text_primary};
  display: none;
  @media screen and (max-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

const NavItemsDiv = styled.div`
  height:100vh;
  display:flex;
`;

const NavItems = styled.ul`
  height:100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  gap:32px;
  font-size:18px;
  list-style: none;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;
const Navlink = styled(NavLink)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => (theme.theme==='true'?theme.white:theme.text_primary)};
  font-weight: 500;
  cursor: pointer;
  transition: all 1s slide-in;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
  &.active {
    color: ${({ theme }) => theme.primary};
    border-bottom: 1.8px solid ${({ theme }) => theme.primary};
  }

  @media screen and (min-width: 768px) {
    &:hover {
      transform:scale(1.15);
    }
  }
`;


const UserContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 6px;
  color: ${({ theme }) => theme.primary};
`;

const MobileMenu = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 16px;
  padding: 0 6px;
  list-style: none;
  width: 90%;
  padding: 12px 40px 24px 40px;
  background: ${({ theme }) => theme.bg};
  position: absolute;
  top: 80px;
  right: 0;
  transition: all 0.6s ease-in-out;
  transform: ${({ isOpen }) =>
    isOpen ? "translateY(0)" : "translateY(-100%)"};
  border-radius: 0 0 20px 20px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  opacity: ${({ isOpen }) => (isOpen ? "100%" : "0")};
  z-index: ${({ isOpen }) => (isOpen ? "1000" : "-1000")};
`;

const StreakIcon = styled.div`
  display:flex;
  align-items:center;
  position: relative;
  z-index: 100;
  cursor:pointer;
`;

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  '& .MuiTooltip-tooltip': {
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '300',
    borderRadius: '8px',
  },
  "& .MuiTooltip-arrow": {
    color: "#007bff",
  },
});

const Navbar = ({ currentUser }) => {

  const handleProfileModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);

  };

  useEffect(() => {
    const streakData = async () => {
      const token = localStorage.getItem("fittrack-app-token");
      await getDashboardDetails(token).then((res) => {
        setStreakValue(res.data.streekCount);
        console.log(`Streak output${res.data.streekCount}`);
      });
    }

    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("fittrack-app-token");
        const res = await getProfileData(token, currentUser.id);
        setProfileData(res.data.data); // Save the fetched profile data
      } catch (err) {
        console.log(err)
        console.error("Failed to fetch profile data:", err);
      }
    };
    fetchProfileData();
    streakData();
  }, [currentUser]);

  const updateProfile = async (updateProfile) => {
    try {
      updateProfile.userId = currentUser.id;
      updateProfile.profilePic = profilePic; // Add Base64 image
      const token = localStorage.getItem("fittrack-app-token");

      if (!token) {
        throw new Error("Token not found");
      }

      const res = await updateProfileData(token, updateProfile);

      setProfileData(res.data.data); // Update profile data in state
      closeModal(); // Close modal after successful update

    } catch (err) {
      alert("Failed to update profile: " + err.message);
      console.log("API error:", err);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];

    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }
    try {
      const compressedFile = await imageCompression(file, options);
      console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
      console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result); // Update the profilePic state with base64 string
      };
      if (compressedFile) {
        reader.readAsDataURL(compressedFile);
      };
    } catch (error) {
      console.log(error);
    }

  };

  const handleStreak = (value) => {
    if (value < 3) {
      return streaks[0];
    } else if (value < 5) {
      return streaks[1];
    } else if (value < 6) {
      return streaks[2];
    } else {
      return streaks[3];
    }
  }

  const streaks = [Streak, StreakYellow, StreakOrange, StreakRed];
  const [streakValue, setStreakValue] = useState(0);
  const [isOpen, setisOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const [profileData, setProfileData] = useState({
    userId: currentUser.id,
    userName: 'fitNest',
    email: 'fitNest@gmail.com',
    height: '0',
    weight: '0',
    dob: new Date(),
    userMobile:'0000000000',
    profilePic: null,
  });
  const initialProfile = profileData;
  return (
    <Nav>
      <NavContainer>
        <Mobileicon onClick={() => setisOpen(!isOpen)}>
          <MenuRounded sx={{ color: "inherit" }} />
        </Mobileicon>
        <NavLogoDiv>
          <Logo src={LogoImg} />
          <AppName >fit<Header_text>N</Header_text>est</AppName>
        </NavLogoDiv>
        <MobileMenu isOpen={isOpen}>
          <Navlink to="/">Dashboard</Navlink>
          <Navlink to="/tutorials">Tutorials</Navlink>
          <Navlink to="/launchworkout">Launch-Workout</Navlink>
          <Navlink to="/bmi">BMI</Navlink>
          <Navlink to="/history">History</Navlink>
          <Navlink to="/contact">Contact</Navlink>
        </MobileMenu>

        <NavItemsDiv>
          <NavItems>
            <Navlink to="/">Dashboard</Navlink>
            <Navlink to="/tutorials">Tutorials</Navlink>
            <Navlink to="/launchworkout">Launch-Workout</Navlink>
            <Navlink to="/bmi">BMI</Navlink>
            <Navlink to="/history">History</Navlink>
            <Navlink to="/contact">Contact</Navlink>
          </NavItems>
        </NavItemsDiv>
        <StreakIcon>
          <CustomTooltip title={`workout streak  ${streakValue} days`} arrow placement="top" >
            <div>
              <Lottie animationData={handleStreak(streakValue)} style={{ height: '80px', width: '80px', }} />
            </div>
          </CustomTooltip>
        </StreakIcon>
        <UserContainer>
          <ProfileIcon onClick={handleProfileModal}>
            <Avatar src={initialProfile.profilePic}></Avatar>
          </ProfileIcon>
          {isModalOpen && (
            <Profile
              isModalOpen={isModalOpen}
              onClose={closeModal}
              userProfile={initialProfile}
              updateProfile={updateProfile}
              handleProfilePicChange={handleProfilePicChange}
              profilePic={profilePic}
            />
          )}

        </UserContainer>
      </NavContainer>
    </Nav>
  );
};

Navbar.propTypes = {
  currentUser: PropTypes.any,
  id: PropTypes.any,
  email: PropTypes.any

};


export default Navbar;


