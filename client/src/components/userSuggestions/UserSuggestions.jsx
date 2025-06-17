import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import "./userSuggestions.scss";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/authContext";

const UserSuggestions = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useContext(AuthContext);

  // 本地状态，禁用处理中用户id
  const [processingUserIds, setProcessingUserIds] = useState([]);
  // 本地状态，已dismiss隐藏的用户id
  const [dismissedUserIds, setDismissedUserIds] = useState([]);

  // 获取推荐用户
  const { data: suggestedUsers = [], isLoading: isSuggestionsLoading } =
    useQuery({
      queryKey: ["suggestions"],
      queryFn: () =>
        makeRequest.get("/users/suggestions").then((res) => res.data),
    });

  // 获取我关注的用户列表（数组，内容是id）
  const { data: followings = [], isLoading: isFollowingsLoading } = useQuery({
    queryKey: ["followings"],
    queryFn: () =>
      makeRequest
        .get("/relationships?followerUserId=" + currentUser.id)
        .then((res) => res.data),
  });

  // 关注/取关 mutation
  const followMutation = useMutation({
    mutationFn: ({ userId, action }) => {
      if (action === "unfollow") {
        return makeRequest.delete("/relationships", { params: { userId } });
      } else {
        return makeRequest.post("/relationships", { userId });
      }
    },
    onSuccess: (data, variables) => {
      // ✅ 更新关注缓存
      queryClient.setQueryData(["followings"], (old = []) => {
        if (variables.action === "follow") {
          if (!old.includes(variables.userId)) {
            return [...old, variables.userId];
          }
          return old;
        } else {
          return old.filter((id) => id !== variables.userId);
        }
      });
  
      // ✅ 强制刷新帖子列表（首页用的是 /posts/followed）
      queryClient.invalidateQueries(["posts"]);
    },
  });
  

  // 关注/取关按钮事件
  const handleFollowToggle = (userId) => {
    setProcessingUserIds((prev) => [...prev, userId]);

    const isFollowing = followings.includes(userId);
    const action = isFollowing ? "unfollow" : "follow";

    followMutation.mutate(
      { userId, action },
      {
        onSettled: () => {
          setProcessingUserIds((prev) => prev.filter((id) => id !== userId));
        },
      }
    );
  };

  const handleDismiss = (userId) => {
    if (followings.includes(userId)) {
      setProcessingUserIds((prev) => [...prev, userId]);
      followMutation.mutate(
        { userId, action: "unfollow" },
        {
          onSettled: () => {
            setProcessingUserIds((prev) => prev.filter((id) => id !== userId));
          },
        }
      );
    }
    // 未关注，dismiss不做任何操作
  };
  

  const isLoadingCombined = isSuggestionsLoading || isFollowingsLoading;

  return (
    <div className="userSuggestions">
      <span>Suggestions For You</span>
      {isLoadingCombined
        ? "加载中..."
        : suggestedUsers
            .filter((user) => !dismissedUserIds.includes(user.id))
            .map((user) => {
              const isFollowing = followings.includes(user.id);
              const isProcessing = processingUserIds.includes(user.id);

              return (
                <div className="user" key={user.id}>
                  <div className="userInfo">
                    <img src={"/upload/" + user.profilePic} alt="" />
                    <span>{user.name}</span>
                  </div>
                  <div className="buttons">
                    <button
                      onClick={() => handleFollowToggle(user.id)}
                      disabled={isProcessing}
                    >
                      {isFollowing ? "following" : "follow"}
                    </button>
                    <button
                      onClick={() => handleDismiss(user.id)}
                      disabled={isProcessing}
                    >
                      dismiss
                    </button>
                  </div>
                </div>
              );
            })}
    </div>
  );
};

export default UserSuggestions;
