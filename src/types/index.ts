export interface User {
  uid: string;
  username?: string;
  email: string;
  photoURL?: string;
}

export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  userId: string;
  username: string;
  createdAt: number;
  likes: number;
  month: string;
  year: string;
  userPhotoURL?: string;
}

export interface UserLike {
  postId: string;
  userId: string;
}

export interface ImgBBResponse {
  data: {
    id: string;
    url: string;
    display_url: string;
    image: {
      url: string;
    };
  };
  success: boolean;
  status: number;
}
