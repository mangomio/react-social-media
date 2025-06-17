import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { useContext, useState } from "react";
import Update from "../../components/update/Update";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);

  const userId = parseInt(useLocation().pathname.split("/")[2]);
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // 获取用户信息
  const { isLoading, error, data } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      makeRequest.get("/users/find/" + userId).then((res) => res.data),
  });

  // 获取当前用户关注列表（id数组）
  const { data: followings = [], isLoading: isFollowingsLoading } = useQuery({
    queryKey: ["followings"],
    queryFn: () =>
      makeRequest
        .get("/relationships?followerUserId=" + currentUser.id)
        .then((res) => res.data),
  });

  // 关注/取关 mutation，接口和 UserSuggestions 保持一致
  const followMutation = useMutation({
    mutationFn: ({ userId, action }) => {
      if (action === "unfollow") {
        return makeRequest.delete("/relationships", { params: { userId } });
      } else {
        return makeRequest.post("/relationships", { userId });
      }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["followings"], (old = []) => {
        if (variables.action === "follow") {
          if (!old.includes(variables.userId))
            return [...old, variables.userId];
          return old;
        } else {
          return old.filter((id) => id !== variables.userId);
        }
      });
      // 视情况刷新其他数据
      queryClient.invalidateQueries(["posts"]);
    },
  });

  if (isLoading || isFollowingsLoading) return "loading";
  if (error) return "加载失败";

  const isFollowing = followings.includes(userId);

  const handleFollowToggle = () => {
    const action = isFollowing ? "unfollow" : "follow";
    followMutation.mutate({ userId, action });
  };

  return (
    <div className="profile">
      <div className="images">
        <img src={"/upload/" + data.coverPic} alt="" className="cover" />
        <img src={"/upload/" + data.profilePic} alt="" className="profilePic" />
      </div>
      <div className="profileContainer">
        <div className="uInfo">
          <div className="left">
            <a href="http://facebook.com">
              <FacebookTwoToneIcon fontSize="large" />
            </a>
            <a href="http://instagram.com">
              <InstagramIcon fontSize="large" />
            </a>
            <a href="http://twitter.com">
              <TwitterIcon fontSize="large" />
            </a>
            <a href="http://linkedin.com">
              <LinkedInIcon fontSize="large" />
            </a>
            <a href="http://pinterest.com">
              <PinterestIcon fontSize="large" />
            </a>
          </div>
          <div className="center">
            <span>{data.name}</span>
            <div className="info">
              <div className="item">
                <PlaceIcon />
                <span>{data.city}</span>
              </div>
              <div className="item">
                <LanguageIcon />
                <span>{data.website}</span>
              </div>
            </div>
            {userId === currentUser.id ? (
              <button onClick={() => setOpenUpdate(true)}>update</button>
            ) : (
              <button onClick={handleFollowToggle}>
                {isFollowing ? "following" : "follow"}
              </button>
            )}
          </div>
          <div className="right">
            <EmailOutlinedIcon />
            <MoreVertIcon />
          </div>
        </div>
        <Posts userId={userId} />
      </div>
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
    </div>
  );
};

export default Profile;
