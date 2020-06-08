class CalculatingController < ApplicationController

    def index
        @result = []
        if params[:start_date] and params[:end_date]

            start_date = Date.parse(params[:start_date])
            end_date = Date.parse(params[:end_date])
            cost = params[:cost].to_f
            daily_cost = params[:daily_cost].to_f

            (start_date..end_date).to_a.each do |day|
                day_cost = { date: day.strftime('%a, %d %b %Y'), cost: daily_cost }
                if params[:all_time_period] == "1"
                    day_cost[:cost] += (cost / 7)
                else
                    total = (Date.new(day.year, day.month, -1).day).to_f
                    day_cost[:cost] += (cost / Date.new(day.year, day.month, -1).day)
                end
                @result << day_cost
            end
            render 'show'
        end
        
    end
    
    def show
        render @result
    end

end
