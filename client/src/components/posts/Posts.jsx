import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
const Posts = ({ userId }) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () =>
      userId
        ? makeRequest.get("/posts?userId=" + userId).then((res) => res.data)
        : makeRequest.get("/posts/followed").then((res) => res.data),
  });

  return (
    <div className="posts">
      {error
        ? "出错了"
        : isPending
        ? "加载中..."
        : data.map((post) => <Post post={post} key={post.id} />)}
    </div>
  );
};


export default Posts;
