import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { TvShow } from './tv-show';

@Injectable({
  providedIn: 'root',
})
export class TvShowsService {
  tvShows: Observable<TvShow[]>;
  tvShowDetails: TvShow = null;
  private series = 'table_show';
  private apiUrl = ' https://api.tvmaze.com/singlesearch/shows?q=';

  constructor(private http: HttpClient, private af: AngularFirestore) {
    this.tvShows = af
      .collection(this.series)
      .valueChanges({ idField: 'uid' }) as Observable<TvShow[]>;
  }

  async getTvShowDetails(show: TvShow) {
    try {
      const dataObservable = this.http.get(
        `${this.apiUrl}${show.title}`
      );

      const data: any = await lastValueFrom(dataObservable);

      show.summary = data.summary;
      show.image = data.image.medium;
      this.tvShowDetails = show;
    } catch (e) {
      this.handleError('getTvShowDetails', e);
    }
  }

  async addTvShow(show: TvShow){
    try{
      const dataObservable = this.http.get(
        `${this.apiUrl}${show.title}`
      );

      const data: any = await lastValueFrom(dataObservable);

      if(data.name != show.title){
        this.af.collection(this.series).add({
          id: show.id,
          title: show.title
        })
      }
    }
    catch(e){
      this.handleError('addTvShow', e);
    }
  }

  updateTvShow(show: TvShow) {
    this.af.collection(this.series).doc(show.uid).update({
      id: show.id,
      title: show.title
    })
  }

  deleteTvShow(show: TvShow) {
    this.af.collection(this.series).doc(show.uid).delete();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
