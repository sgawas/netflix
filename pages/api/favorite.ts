import { NextApiRequest, NextApiResponse } from "next";
import { without } from "lodash";

import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      console.log("=======");
      if (req.method === 'POST') {
        console.log("------");
        const { currentUser } = await serverAuth(req);
        
        const { movieId } = req.body;
        const existingMovie = await prismadb.movie.findUnique({
          where: {
            id: movieId,
          }
        });
    
        if (!existingMovie) {
          throw new Error('Invalid Movie ID');
        }
    
        const user = await prismadb.user.update({
          where: {
            email: currentUser.email || '',
          },
          data: {
            favoriteIds: {
              push: movieId
            }
          }
        });
    
        return res.status(200).json(user);
      }
  
      if (req.method === 'DELETE') {
        const { currentUser } = await serverAuth(req);
  
        const { movieId } = req.body;
  
        const existingMovie = await prismadb.movie.findUnique({
          where: {
            id: movieId,
          }
        });
  
        if (!existingMovie) {
          throw new Error('Invalid Movie ID');
        }
  
        const updatedFavoriteIds = without(currentUser.favoriteIds, movieId);
  
        const updatedUser = await prismadb.user.update({
          where: {
            email: currentUser.email || '',
          },
          data: {
            favoriteIds: updatedFavoriteIds,
          }
        });
  
        return res.status(200).json(updatedUser);
      }
      
      return res.status(405).end();
    } catch (error) {
      console.log(error);
  
      return res.status(400).end();
    }
}