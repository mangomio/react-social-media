import { useState, useContext } from "react";
import "./update.scss";
import { makeRequest } from "../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/authContext";

const Update = ({ setOpenUpdate, user }) => {
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [texts, setTexts] = useState({
    name: "",
    city: "",
    website: "",
  });

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (user) => {
      return makeRequest.put("/users", user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });
  
  const { updateUser } = useContext(AuthContext);

  const handleClick = async (e) => {
    e.preventDefault();
    let coverUrl;
    let profileUrl;

    coverUrl = cover ? await upload(cover) : user.coverPic;
    profileUrl = profile ? await upload(profile) : user.profilePic;

    const updatedData = {
      ...texts,
      coverPic: coverUrl,
      profilePic: profileUrl,
    };

    mutation.mutate(
      { ...user, ...updatedData },
      {
        onSuccess: () => {
          updateUser(updatedData); // 更新当前登录用户
          setOpenUpdate(false);
        },
      }
    );
  };
  
  return (
    <div className="update">
      Update  Information
      <form>
        <div className="file-inputs">
          上传背景图片<input type="file" onChange={(e) => setCover(e.target.files[0])} />
          上传头像<input type="file" onChange={(e) => setProfile(e.target.files[0])} />
        </div>
        <input
          type="text"
          name="name"
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="city"
          onChange={handleChange}
          placeholder="City"
        />
        <input
          type="text"
          name="website"
          onChange={handleChange}
          placeholder="Website"
        />
        <button type="submit" onClick={handleClick}>
          Update
        </button>
      </form>
      <button className="close-btn" onClick={() => setOpenUpdate(false)}>
        ×
      </button>
    </div>
  );
};

export default Update;
